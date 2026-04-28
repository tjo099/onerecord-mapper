import { describe, expect, it } from 'vitest'
import type { Change } from '../../src/classes/change/schema.js'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import type { Waybill } from '../../src/classes/waybill/schema.js'
import { WaybillCodec, applyChange } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> prototype_pollution_attempt (envelope-level)', () => {
  it('rejects __proto__ key in input as prototype_pollution_attempt', () => {
    // Use Object.defineProperty to actually set a __proto__ own property
    // (spread/assign silently skips __proto__ in most JS engines).
    const malicious = Object.defineProperty({ ...createWaybill() }, '__proto__', {
      value: { polluted: 1 },
      enumerable: true,
      configurable: true,
      writable: true,
    }) as unknown
    const r = deserializeWaybill(malicious)
    // The pre-validate pollution scanner catches this before Zod
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(['prototype_pollution_attempt', 'zod_validation']).toContain(r.error.kind)
    }
  })
})

describe('applyChange -> prototype_pollution_attempt + invalid_pointer', () => {
  const wb: Waybill = {
    '@context': CARGO_CONTEXT_IRI,
    '@type': 'Waybill',
    '@id': 'https://test.example/test/waybill/wb1',
    waybillType: 'MASTER',
    waybillPrefix: '123',
    waybillNumber: '12345678',
  }

  it('rejects an Operation whose path targets __proto__', () => {
    const change: Change = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Change',
      '@id': 'https://test.example/test/change/c1',
      hasOperation: [
        {
          '@context': CARGO_CONTEXT_IRI,
          '@type': 'Operation',
          '@id': 'https://test.example/test/operation/op1',
          op: 'ADD',
          path: '/__proto__/polluted',
          value: true,
        },
      ],
    }
    const r = applyChange(WaybillCodec, wb, change)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      // applyChange wraps per-op failures as change_partial_failure with the
      // underlying kind preserved on .cause
      expect(r.error.kind).toBe('change_partial_failure')
      if (r.error.kind === 'change_partial_failure') {
        expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
      }
    }
  })

  it('rejects an Operation whose path is not a valid JSON-pointer', () => {
    const change: Change = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Change',
      '@id': 'https://test.example/test/change/c2',
      hasOperation: [
        {
          '@context': CARGO_CONTEXT_IRI,
          '@type': 'Operation',
          '@id': 'https://test.example/test/operation/op2',
          op: 'ADD',
          // Missing leading slash — asJsonPointer rejects with invalid_pointer
          path: 'no-leading-slash',
          value: 'bad',
        },
      ],
    }
    const r = applyChange(WaybillCodec, wb, change)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('change_partial_failure')
      if (r.error.kind === 'change_partial_failure') {
        expect(r.error.cause.kind).toBe('invalid_pointer')
      }
    }
  })
})
