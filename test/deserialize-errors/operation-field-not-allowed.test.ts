import { describe, expect, it } from 'vitest'
import { asJsonPointer, validateOperation } from '../../src/index.js'
import type { Operation } from '../../src/classes/operation/schema.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

describe('deserialize -> operation_field_not_allowed', () => {
  it('rejects an Operation whose path is not on the allow-list', () => {
    const op: Operation = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Operation',
      '@id': 'https://test.example/test/operation/op1',
      op: 'ADD',
      path: '/secretField',
      value: 'unauthorized-mutation',
    }
    const allowed = asJsonPointer('/optionStatus')
    expect(allowed.ok).toBe(true)
    if (!allowed.ok) return
    const r = validateOperation(op, [allowed.value])
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('operation_field_not_allowed')
      if (r.error.kind === 'operation_field_not_allowed') {
        expect(r.error.field).toBe('/secretField')
      }
    }
  })

  it('accepts an Operation whose path is on the allow-list', () => {
    const op: Operation = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Operation',
      '@id': 'https://test.example/test/operation/op2',
      op: 'ADD',
      path: '/optionStatus',
      value: 'OPTION_REJECTED',
    }
    const allowed = asJsonPointer('/optionStatus')
    expect(allowed.ok).toBe(true)
    if (!allowed.ok) return
    const r = validateOperation(op, [allowed.value])
    expect(r.ok).toBe(true)
  })
})
