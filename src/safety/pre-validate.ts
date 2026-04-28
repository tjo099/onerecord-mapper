import type { ParseResult } from '../result.js'
import { detectCycle } from './circular-ref.js'
import type { SafetyLimits } from './limits.js'
import { mergeLimits } from './limits.js'
import { scanForPollution } from './prototype-pollution.js'
import { walkGraph } from './walk-graph.js'

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

  // 2. Recursive walk — delegates to walkGraph for depth/node/string/array
  // limit enforcement. Behavior is byte-equivalent to the inline walk
  // preValidate carried through v0.1.x; visitor-pattern extraction makes
  // the same single-traversal usable by src/dispatch/graph-walk.ts.
  const walkR = walkGraph(input, { limits, ...(opts.meta ? { meta: opts.meta } : {}) })
  if (!walkR.ok) return walkR

  // 3. Prototype-pollution
  const pollR = scanForPollution(input, '$')
  if (!pollR.ok) return pollR

  // 4. JS cycles
  const cycleR = detectCycle(input)
  if (!cycleR.ok) return cycleR

  return { ok: true, value: input }
}
