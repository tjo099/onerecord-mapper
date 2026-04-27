// src/operations/apply-change.ts
import type { Codec } from '../classes/shared/codec.js'
import type { ParseError, ParseResult } from '../result.js'
import { isValidArrayIndex } from '../safety/path-traversal.js'
import type { JsonPointer } from './json-pointer.js'
import { asJsonPointer, splitPointer } from './json-pointer.js'
import { validateOperation } from './validate-operation.js'

export interface OperationLike {
  op: 'ADD' | 'DELETE'
  path: string
  value?: unknown
}

export interface ChangeLike {
  hasOperation: ReadonlyArray<OperationLike>
}

/**
 * v2 (A1-M3, A3-M1): allowedFields type matches spec §13 exactly (no `| string` arm).
 */
export interface ApplyChangeOpts {
  allowedFields?: ReadonlyArray<JsonPointer | RegExp>
}

function nullProtoClone(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v
  if (Array.isArray(v)) return v.map(nullProtoClone)
  const out = Object.create(null) as Record<string, unknown>
  for (const k of Object.getOwnPropertyNames(v)) {
    out[k] = nullProtoClone((v as Record<string, unknown>)[k])
  }
  return out
}

/** v3 (A1-R2-B2): build an invalid_pointer ParseError. */
function pointerErr(
  pointer: string,
  reason: 'empty' | 'segment_not_object' | 'segment_missing',
  path: string,
): ParseError {
  return { kind: 'invalid_pointer', pointer, reason, path }
}

/**
 * v3 (A1-R2-B2): traversal failures emit `invalid_pointer`, not `invalid_iri`.
 * Array-index validation continues to emit `prototype_pollution_attempt` for
 * non-canonical indices (length, -1, 1.5, NaN, leading zero, etc.) — that's a
 * different threat (attacker probing Array prototype), distinct from a benign
 * "this pointer doesn't resolve on this object" failure.
 */
function setAtPath(
  root: unknown,
  segments: readonly string[],
  pointer: string,
  value: unknown,
): ParseResult<true> {
  if (segments.length === 0) {
    return { ok: false, error: pointerErr(pointer, 'empty', '$') }
  }
  // Reject any empty-string segment — "/" has one segment "" which is not a valid field name
  for (const seg of segments) {
    if (seg === '') {
      return { ok: false, error: pointerErr(pointer, 'empty', '$') }
    }
  }
  let cur: unknown = root
  for (let i = 0; i < segments.length - 1; i++) {
    if (cur === null || typeof cur !== 'object') {
      return {
        ok: false,
        error: pointerErr(pointer, 'segment_not_object', `/${segments.slice(0, i).join('/')}`),
      }
    }
    const seg = segments[i] ?? ''
    if (Array.isArray(cur)) {
      if (!isValidArrayIndex(seg)) {
        return {
          ok: false,
          error: { kind: 'prototype_pollution_attempt', key: seg, path: `/${segments.join('/')}` },
        }
      }
      cur = (cur as unknown[])[Number(seg)]
    } else {
      let next = (cur as Record<string, unknown>)[seg]
      if (next === undefined) {
        next = Object.create(null) as Record<string, unknown>
        ;(cur as Record<string, unknown>)[seg] = next
      }
      cur = next
    }
    if (cur === undefined) {
      return {
        ok: false,
        error: pointerErr(pointer, 'segment_missing', `/${segments.slice(0, i + 1).join('/')}`),
      }
    }
  }
  const lastKey = segments[segments.length - 1] ?? ''
  if (cur === null || typeof cur !== 'object') {
    return {
      ok: false,
      error: pointerErr(pointer, 'segment_not_object', `/${segments.slice(0, -1).join('/')}`),
    }
  }
  if (Array.isArray(cur)) {
    if (!isValidArrayIndex(lastKey)) {
      return {
        ok: false,
        error: {
          kind: 'prototype_pollution_attempt',
          key: lastKey,
          path: `/${segments.join('/')}`,
        },
      }
    }
    ;(cur as unknown[])[Number(lastKey)] = value
  } else {
    ;(cur as Record<string, unknown>)[lastKey] = value
  }
  return { ok: true, value: true }
}

function deleteAtPath(
  root: unknown,
  segments: readonly string[],
  pointer: string,
): ParseResult<{ existed: boolean }> {
  if (segments.length === 0) return { ok: true, value: { existed: false } }
  let cur: unknown = root
  for (let i = 0; i < segments.length - 1; i++) {
    if (cur === null || typeof cur !== 'object') return { ok: true, value: { existed: false } }
    const seg = segments[i] ?? ''
    if (Array.isArray(cur)) {
      if (!isValidArrayIndex(seg)) {
        return {
          ok: false,
          error: { kind: 'prototype_pollution_attempt', key: seg, path: `/${segments.join('/')}` },
        }
      }
      cur = (cur as unknown[])[Number(seg)]
    } else {
      cur = (cur as Record<string, unknown>)[seg]
    }
  }
  if (cur === null || typeof cur !== 'object') return { ok: true, value: { existed: false } }
  const lastKey = segments[segments.length - 1] ?? ''
  if (Array.isArray(cur)) {
    if (!isValidArrayIndex(lastKey)) {
      return {
        ok: false,
        error: {
          kind: 'prototype_pollution_attempt',
          key: lastKey,
          path: `/${segments.join('/')}`,
        },
      }
    }
    const idx = Number(lastKey)
    if (idx < 0 || idx >= (cur as unknown[]).length) return { ok: true, value: { existed: false } }
    ;(cur as unknown[]).splice(idx, 1)
    return { ok: true, value: { existed: true } }
  }
  if (!Object.prototype.hasOwnProperty.call(cur, lastKey))
    return { ok: true, value: { existed: false } }
  delete (cur as Record<string, unknown>)[lastKey]
  return { ok: true, value: { existed: true } }
}

export function applyChange<App, Wire>(
  codec: Codec<App, Wire>,
  obj: App,
  change: ChangeLike,
  opts: ApplyChangeOpts = {},
): ParseResult<App> {
  if (change.hasOperation.length === 0) return { ok: true, value: obj }

  // Pre-validate: paths + (optional) field allowlist
  for (let i = 0; i < change.hasOperation.length; i++) {
    const op = change.hasOperation[i]
    if (op === undefined) continue
    if (opts.allowedFields !== undefined) {
      const v = validateOperation(op, opts.allowedFields)
      if (!v.ok) {
        return {
          ok: false,
          error: {
            kind: 'change_partial_failure',
            failedAt: i,
            total: change.hasOperation.length,
            cause: v.error,
          },
        }
      }
    }
    const p = asJsonPointer(op.path)
    if (!p.ok) {
      return {
        ok: false,
        error: {
          kind: 'change_partial_failure',
          failedAt: i,
          total: change.hasOperation.length,
          cause: p.error,
        },
      }
    }
  }

  const clone = nullProtoClone(obj)

  for (let i = 0; i < change.hasOperation.length; i++) {
    const op = change.hasOperation[i]
    if (op === undefined) continue
    const p = asJsonPointer(op.path)
    if (!p.ok) {
      return {
        ok: false,
        error: {
          kind: 'change_partial_failure',
          failedAt: i,
          total: change.hasOperation.length,
          cause: p.error,
        },
      }
    }
    const segments = splitPointer(p.value)
    const r =
      op.op === 'ADD'
        ? setAtPath(clone, segments, op.path, op.value)
        : deleteAtPath(clone, segments, op.path)
    if (!r.ok) {
      return {
        ok: false,
        error: {
          kind: 'change_partial_failure',
          failedAt: i,
          total: change.hasOperation.length,
          cause: r.error,
        },
      }
    }
  }

  const r = codec.schema.safeParse(clone)
  if (!r.success) {
    return {
      ok: false,
      error: {
        kind: 'change_partial_failure',
        failedAt: change.hasOperation.length - 1,
        total: change.hasOperation.length,
        cause: {
          kind: 'zod_validation',
          issues: r.error.issues.map((issue) => ({
            path: issue.path.length === 0 ? '$' : issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
      },
    }
  }

  // v2 (A1-M5): final null-proto clone of returned graph
  return { ok: true, value: nullProtoClone(r.data) as App }
}
