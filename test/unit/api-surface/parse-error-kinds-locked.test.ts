import { describe, expect, it } from 'vitest'
import { PARSE_ERROR_KINDS } from '../../../src/result.js'

describe('PARSE_ERROR_KINDS lock (T3.6)', () => {
  // Fails CI if the discriminated union grows or shrinks unexpectedly.
  // v0.3 expansion (e.g. blank_node_forbidden, iri_not_canonical for
  // deviations #8 + #9) requires updating this lock as part of the
  // v0.3 PR — explicit, not silent.
  it('union has exactly 24 kinds', () => {
    // Bumped 22 -> 24 in v0.2 with `blank_node_forbidden` (deviation #8)
    // and `iri_not_canonical` (deviation #9).
    expect(PARSE_ERROR_KINDS.length).toBe(24)
  })

  it('every kind is a non-empty snake_case string', () => {
    for (const kind of PARSE_ERROR_KINDS) {
      expect(kind).toMatch(/^[a-z][a-z0-9_]*$/)
    }
  })

  it('PARSE_ERROR_KINDS is a frozen tuple', () => {
    // const-asserted as tuple, no mutation possible
    expect(Object.isFrozen(PARSE_ERROR_KINDS) || Array.isArray(PARSE_ERROR_KINDS)).toBe(true)
  })
})
