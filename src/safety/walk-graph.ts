import type { ParseResult } from '../result.js'
import { type SafetyLimits, mergeLimits } from './limits.js'

export interface WalkGraphOpts {
  limits?: Partial<SafetyLimits>
  meta?: Record<string, unknown>
}

export type NodeVisitor = (node: unknown, path: string, depth: number) => void

/**
 * Recursive graph walker with safety-limit enforcement.
 *
 * If `visitor` is provided, called once per visited value (object,
 * array element, scalar) during the walk, BEFORE limit checks for
 * children. Used by:
 *  - `preValidate` (no visitor; safety-limit enforcement only).
 *  - `src/dispatch/graph-walk.ts` (visitor collects {@id, @type,
 *    parent-field info} for cross-node analysis).
 *
 * Single traversal; dispatch mode does not double-walk.
 *
 * Error kinds emitted (each wrapped in `metaSlice`):
 *  - node_count_limit_exceeded
 *  - depth_limit_exceeded
 *  - string_too_long
 *  - array_too_long
 *
 * Behavior is byte-equivalent to the inline walk that `preValidate`
 * used through v0.1.x; this module exists to make the visitor reusable.
 */
export function walkGraph(
  input: unknown,
  opts: WalkGraphOpts = {},
  visitor?: NodeVisitor,
): ParseResult<true> {
  const limits = mergeLimits(opts.limits)
  const metaSlice = opts.meta ? { meta: opts.meta } : {}
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
    if (visitor) visitor(v, path, depth)
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

  return walk(input, 0, '$')
}
