import { describe, expect, it } from 'vitest'
import {
  PriceCodec,
  PriceSchema,
  deserializePrice,
  serializePrice,
  serializePriceStrict,
} from '../../../src/classes/price/index.js'
import type { ParseResult } from '../../../src/result.js'
import { envelope } from '../../factories/common.js'
import { createPrice } from '../../factories/price.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Price',
  schema: PriceSchema,
  serialize: serializePrice,
  serializeStrict: serializePriceStrict,
  deserialize: deserializePrice,
  codec: PriceCodec,
  factory: createPrice,
  emptyArrayField: 'ratings',
  invalidIriField: 'forBookingOption',
})

function expectKind(r: ParseResult<unknown>, kind: string, path?: string): void {
  expect(r.ok).toBe(false)
  if (r.ok) return
  expect(r.error.kind).toBe(kind)
  if (path !== undefined && r.error.kind === 'zod_validation') {
    expect(r.error.issues[0]?.path).toBe(path)
  }
}

describe('Price explicit cases', () => {
  it('fully populated object parses', () => {
    const r = deserializePrice(createPrice())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.chargeCode).toBe('PP')
      expect(r.value.forBookingOption).toBeDefined()
      expect(r.value.grandTotal).toBe(1250.5)
      expect(r.value.ratings).toHaveLength(1)
    }
  })
  it('envelope-only parses', () => {
    expect(deserializePrice(envelope('Price')).ok).toBe(true)
  })
  it('ratings with a non-https IRI -> invalid_iri', () => {
    expectKind(deserializePrice({ ...createPrice(), ratings: ['http://attacker'] }), 'invalid_iri')
  })
  it('grandTotal as string -> zod_validation at grandTotal', () => {
    expectKind(
      deserializePrice({ ...createPrice(), grandTotal: '100' }),
      'zod_validation',
      'grandTotal',
    )
  })
  it('currency key -> zod_validation (unrecognized_keys)', () => {
    const r = deserializePrice({ ...createPrice(), currency: 'NOK' })
    expectKind(r, 'zod_validation')
    if (!r.ok && r.error.kind === 'zod_validation') {
      expect(r.error.issues[0]?.code).toBe('unrecognized_keys')
    }
  })
  it('negative amounts accepted (credit lines)', () => {
    const r = deserializePrice({ ...createPrice(), grandTotal: -50 })
    expect(r.ok).toBe(true)
  })
})
