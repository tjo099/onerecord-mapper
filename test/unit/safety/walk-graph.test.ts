import { describe, expect, it } from 'vitest'
import { DEFAULT_SAFETY_LIMITS } from '../../../src/safety/limits.js'
import { walkGraph } from '../../../src/safety/walk-graph.js'

describe('walkGraph — visitor-pattern recursive walker', () => {
  it('visits every node in depth-first order', () => {
    const visited: string[] = []
    const input = {
      '@id': 'https://example/root',
      child: { '@id': 'https://example/child', leaf: 'value' },
      array: [{ '@id': 'https://example/in-array' }],
    }
    const r = walkGraph(input, { limits: DEFAULT_SAFETY_LIMITS }, (node, path) => {
      if (typeof node === 'object' && node !== null && '@id' in node) {
        visited.push(`${path}=${(node as Record<string, unknown>)['@id']}`)
      }
    })
    expect(r.ok).toBe(true)
    expect(visited).toEqual([
      '$=https://example/root',
      '$.child=https://example/child',
      '$.array[0]=https://example/in-array',
    ])
  })

  it('emits depth_limit_exceeded with the same shape as preValidate', () => {
    const r = walkGraph(
      { a: { b: { c: { d: { e: { f: 'too deep' } } } } } },
      { limits: { ...DEFAULT_SAFETY_LIMITS, maxDepth: 3 } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('depth_limit_exceeded')
      if (r.error.kind === 'depth_limit_exceeded') {
        expect(r.error.limit).toBe(3)
      }
    }
  })

  it('emits node_count_limit_exceeded when node count exceeds limit', () => {
    const arr = Array.from({ length: 50 }, (_, i) => ({ id: i }))
    const r = walkGraph(arr, { limits: { ...DEFAULT_SAFETY_LIMITS, maxNodes: 10 } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('node_count_limit_exceeded')
  })

  it('emits string_too_long when a string exceeds limit', () => {
    const r = walkGraph(
      { s: 'x'.repeat(100) },
      {
        limits: { ...DEFAULT_SAFETY_LIMITS, maxStringLength: 50 },
      },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('string_too_long')
  })

  it('threads opts.meta into emitted errors', () => {
    const r = walkGraph(
      { s: 'x'.repeat(100) },
      { limits: { ...DEFAULT_SAFETY_LIMITS, maxStringLength: 50 }, meta: { req: 'r1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ req: 'r1' })
  })
})
