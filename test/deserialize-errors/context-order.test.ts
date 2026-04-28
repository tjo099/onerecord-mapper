import { describe, expect, it } from 'vitest'
import { checkContextOrder } from '../../src/dispatch/context-order.js'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

describe('checkContextOrder (deviation #10 closure, deferral E)', () => {
  it('passes for string-form @context (delegated to assertContextAllowed)', () => {
    expect(checkContextOrder(CARGO_CONTEXT_IRI).ok).toBe(true)
  })

  it('passes for an empty array (no context to be order-violated)', () => {
    expect(checkContextOrder([]).ok).toBe(true)
  })

  it('passes for an array whose last element is allowed', () => {
    expect(checkContextOrder([CARGO_CONTEXT_IRI]).ok).toBe(true)
  })

  it('passes for an array where the LAST element is allowed (regardless of earlier)', () => {
    expect(checkContextOrder(['https://attacker.com/ns', CARGO_CONTEXT_IRI]).ok).toBe(true)
  })

  it('fails when the LAST element is not in the allowlist', () => {
    const r = checkContextOrder([CARGO_CONTEXT_IRI, 'https://attacker.com/ns'])
    expect(r.ok).toBe(false)
    expect(r.lastUnallowed).toBe('https://attacker.com/ns')
  })
})

describe('dispatchGraphWalk -> context_order_violation (deferral E)', () => {
  it('emits context_order_violation when array @context ends with unallowed', () => {
    const input = {
      '@context': [CARGO_CONTEXT_IRI, 'https://attacker.com/ns'],
      '@type': 'Waybill',
      '@id': 'https://example/wb',
      waybillType: 'MASTER',
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('context_order_violation')
      if (r.error.kind === 'context_order_violation') {
        expect(r.error.lastUnallowed).toBe('https://attacker.com/ns')
        expect(r.error.got).toEqual([CARGO_CONTEXT_IRI, 'https://attacker.com/ns'])
      }
    }
  })

  it('does not emit when array @context ends with the cargo IRI', () => {
    const input = {
      '@context': ['https://other-allowed.example', CARGO_CONTEXT_IRI],
      '@type': 'Waybill',
      '@id': 'https://example/wb',
      shipmentInformation: 'https://example/sh',
    }
    // Note: 'https://other-allowed.example' isn't actually in ALLOWED_CONTEXTS,
    // but checkContextOrder only validates the LAST element. The earlier
    // unallowed entry is the user's choice; effectively-overridden by cargo IRI.
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })

  it('does not emit for string-form @context', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://example/wb',
      shipmentInformation: 'https://example/sh',
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })
})
