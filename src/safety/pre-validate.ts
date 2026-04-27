import type { ParseResult } from '../result.js'
import { detectCycle } from './circular-ref.js'
import type { SafetyLimits } from './limits.js'
import { mergeLimits } from './limits.js'
import { scanForPollution } from './prototype-pollution.js'

export interface PreValidateOpts {
  limits?: Partial<SafetyLimits>
  payloadByteLength?: number
  meta?: Record<string, unknown> // v2 (A3-m2): threaded into every error
}

/**
 * Pre-Zod sanity pass per spec §6.5.2:
 *   1. Payload byte size
 *   2. Recursive walk: depth, node count, string length, array length
 *   3. Prototype-pollution rejection
 *   4. JS-level circular reference detection
 *
 * v2 (A3-m2): opts.meta is threaded into every constructed ParseError.
 *
 * Returns the input as `value` on success so callers can chain.
 */
export function preValidate(input: unknown, opts: PreValidateOpts = {}): ParseResult<unknown> {
  const limits = mergeLimits(opts.limits)
  const metaSlice = opts.meta ? { meta: opts.meta } : {}

  // 1. Payload bytes
  let bytes = opts.payloadByteLength
  if (bytes === undefined) {
    try {
      bytes = JSON.stringify(input).length
    } catch {
      bytes = limits.maxPayloadBytes + 1
    }
  }
  if (bytes > limits.maxPayloadBytes) {
    return {
      ok: false,
      error: {
        kind: 'payload_too_large',
        sizeBytes: bytes,
        limitBytes: limits.maxPayloadBytes,
        ...metaSlice,
      },
    }
  }

  // 2. Recursive walk
  let nodes = 0
  function walk(v: unknown, depth: number, path: string): ParseResult<true> {
    nodes++
    if (nodes > limits.maxNodes) {
      return {
        ok: false,
        error: {
          kind: 'node_count_limit_exceeded',
          count: nodes,
          limit: limits.maxNodes,
          ...metaSlice,
        },
      }
    }
    if (depth > limits.maxDepth) {
      return {
        ok: false,
        error: {
          kind: 'depth_limit_exceeded',
          depth,
          limit: limits.maxDepth,
          path,
          ...metaSlice,
        },
      }
    }
    if (typeof v === 'string') {
      if (v.length > limits.maxStringLength) {
        return {
          ok: false,
          error: {
            kind: 'string_too_long',
            length: v.length,
            limit: limits.maxStringLength,
            path,
            ...metaSlice,
          },
        }
      }
      return { ok: true, value: true }
    }
    if (v === null || typeof v !== 'object') return { ok: true, value: true }
    if (Array.isArray(v)) {
      if (v.length > limits.maxArrayLength) {
        return {
          ok: false,
          error: {
            kind: 'array_too_long',
            length: v.length,
            limit: limits.maxArrayLength,
            path,
            ...metaSlice,
          },
        }
      }
      for (let i = 0; i < v.length; i++) {
        const r = walk(v[i], depth + 1, `${path}[${i}]`)
        if (!r.ok) return r
      }
      return { ok: true, value: true }
    }
    for (const k of Object.getOwnPropertyNames(v)) {
      const r = walk((v as Record<string, unknown>)[k], depth + 1, `${path}.${k}`)
      if (!r.ok) return r
    }
    return { ok: true, value: true }
  }
  const walkR = walk(input, 0, '$')
  if (!walkR.ok) return walkR

  // 3. Prototype-pollution
  const pollR = scanForPollution(input, '$')
  if (!pollR.ok) return pollR

  // 4. JS cycles
  const cycleR = detectCycle(input)
  if (!cycleR.ok) return cycleR

  return { ok: true, value: input }
}
