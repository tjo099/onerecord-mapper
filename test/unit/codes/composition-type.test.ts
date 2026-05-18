import { describe, it, expect } from 'vitest'
import { CompositionType } from '../../../src/codes/index.js'

describe('CompositionType', () => {
  it('accepts the two ontology individuals', () => {
    expect(CompositionType.parse('COMPOSITION')).toBe('COMPOSITION')
    expect(CompositionType.parse('DECOMPOSITION')).toBe('DECOMPOSITION')
  })
  it('rejects anything else', () => {
    expect(() => CompositionType.parse('BUILDUP')).toThrow()
  })
})
