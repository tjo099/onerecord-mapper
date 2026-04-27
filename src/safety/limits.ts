export interface SafetyLimits {
  maxDepth: number
  maxNodes: number
  maxStringLength: number
  maxArrayLength: number
  maxPayloadBytes: number
}

/** Per spec §6.5.1. Frozen — no global mutator (spec §13). */
export const DEFAULT_SAFETY_LIMITS: Readonly<SafetyLimits> = Object.freeze({
  maxDepth: 32,
  maxNodes: 10_000,
  maxStringLength: 65_536,
  maxArrayLength: 5_000,
  maxPayloadBytes: 5_000_000,
})

function nonNeg(field: keyof SafetyLimits, v: number): void {
  if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
    throw new Error(`mergeLimits: ${field} must be a non-negative integer (got ${v})`)
  }
  // v3 (A1-R2-m6): cap upper bound to catch DoS-via-stupendous-limit
  if (v > Number.MAX_SAFE_INTEGER) {
    throw new Error(`mergeLimits: ${field} must be <= Number.MAX_SAFE_INTEGER (got ${v})`)
  }
}

/**
 * Merge a partial override with the defaults. v2: returns a deep-frozen object
 * and rejects negative/non-integer limits. v3: also rejects > Number.MAX_SAFE_INTEGER.
 * The returned value is safe to capture by closure in `createMapper` (Task 76)
 * without later mutation.
 */
export function mergeLimits(partial?: Partial<SafetyLimits>): Readonly<SafetyLimits> {
  const out: SafetyLimits = {
    maxDepth: partial?.maxDepth ?? DEFAULT_SAFETY_LIMITS.maxDepth,
    maxNodes: partial?.maxNodes ?? DEFAULT_SAFETY_LIMITS.maxNodes,
    maxStringLength: partial?.maxStringLength ?? DEFAULT_SAFETY_LIMITS.maxStringLength,
    maxArrayLength: partial?.maxArrayLength ?? DEFAULT_SAFETY_LIMITS.maxArrayLength,
    maxPayloadBytes: partial?.maxPayloadBytes ?? DEFAULT_SAFETY_LIMITS.maxPayloadBytes,
  }
  for (const k of Object.keys(out) as (keyof SafetyLimits)[]) nonNeg(k, out[k])
  return Object.freeze(out)
}

export interface DeserializeOpts {
  limits?: Partial<SafetyLimits>
  payloadByteLength?: number
  allowedContexts?: readonly string[]
  meta?: Record<string, unknown>
}

export interface SerializeOpts {
  iri?: import('../iri/strategy.js').IriStrategy
}
