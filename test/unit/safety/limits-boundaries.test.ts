import { describe, expect, it } from 'vitest'
import { DEFAULT_SAFETY_LIMITS } from '../../../src/safety/limits.js'
import { preValidate } from '../../../src/safety/pre-validate.js'

function nest(n: number): unknown {
  let o: unknown = 1
  for (let i = 0; i < n; i++) o = { x: o }
  return o
}

describe('preValidate — depth boundary', () => {
  it('passes at maxDepth - 1', () => {
    const r = preValidate(nest(DEFAULT_SAFETY_LIMITS.maxDepth - 1), {
      limits: DEFAULT_SAFETY_LIMITS,
    })
    expect(r.ok).toBe(true)
  })

  it('passes at maxDepth (exactly)', () => {
    const r = preValidate(nest(DEFAULT_SAFETY_LIMITS.maxDepth), { limits: DEFAULT_SAFETY_LIMITS })
    expect(r.ok).toBe(true)
  })

  it('fails at maxDepth + 1', () => {
    const r = preValidate(nest(DEFAULT_SAFETY_LIMITS.maxDepth + 1), {
      limits: DEFAULT_SAFETY_LIMITS,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('depth_limit_exceeded')
  })
})

describe('preValidate — string length', () => {
  it('fails at maxStringLength + 1', () => {
    const r = preValidate(
      { x: 'a'.repeat(DEFAULT_SAFETY_LIMITS.maxStringLength + 1) },
      {
        limits: DEFAULT_SAFETY_LIMITS,
      },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('string_too_long')
  })
})

describe('preValidate — array length', () => {
  it('fails at maxArrayLength + 1', () => {
    const arr = new Array(DEFAULT_SAFETY_LIMITS.maxArrayLength + 1).fill(0)
    const r = preValidate({ list: arr }, { limits: DEFAULT_SAFETY_LIMITS })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('array_too_long')
  })
})

describe('preValidate — node count', () => {
  it('fails when total node count exceeds maxNodes', () => {
    const obj: Record<string, number> = {}
    for (let i = 0; i <= DEFAULT_SAFETY_LIMITS.maxNodes + 1; i++) obj[`k${i}`] = i
    const r = preValidate(obj, { limits: DEFAULT_SAFETY_LIMITS })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('node_count_limit_exceeded')
  })
})

describe('preValidate — payload bytes', () => {
  it('respects opts.payloadByteLength when provided', () => {
    const r = preValidate(
      { ok: 1 },
      {
        limits: DEFAULT_SAFETY_LIMITS,
        payloadByteLength: DEFAULT_SAFETY_LIMITS.maxPayloadBytes + 1,
      },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('payload_too_large')
  })

  it('falls back to JSON.stringify length when payloadByteLength absent (v2 — +100k margin)', () => {
    const big = 'x'.repeat(DEFAULT_SAFETY_LIMITS.maxPayloadBytes + 100_000)
    const r = preValidate(
      { blob: big },
      { limits: { ...DEFAULT_SAFETY_LIMITS, maxStringLength: 10_000_000 } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('payload_too_large')
  })
})

describe('preValidate — meta propagation (v2 — A3-m2)', () => {
  it('threads opts.meta into payload_too_large error', () => {
    const r = preValidate(
      { ok: 1 },
      {
        payloadByteLength: DEFAULT_SAFETY_LIMITS.maxPayloadBytes + 1,
        meta: { requestId: 'r1' },
      },
    )
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'r1' })
  })
})
