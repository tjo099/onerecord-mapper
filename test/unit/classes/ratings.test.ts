import { describe, expect, it } from 'vitest'
import {
  RatingsCodec,
  RatingsSchema,
  deserializeRatings,
  serializeRatings,
  serializeRatingsStrict,
} from '../../../src/classes/ratings/index.js'
import type { ParseResult } from '../../../src/result.js'
import { envelope } from '../../factories/common.js'
import { createRatings } from '../../factories/ratings.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Ratings',
  schema: RatingsSchema,
  serialize: serializeRatings,
  serializeStrict: serializeRatingsStrict,
  deserialize: deserializeRatings,
  codec: RatingsCodec,
  factory: createRatings,
  emptyArrayField: 'forPrices',
})

function expectKind(r: ParseResult<unknown>, kind: string, path?: string): void {
  expect(r.ok).toBe(false)
  if (r.ok) return
  expect(r.error.kind).toBe(kind)
  if (path !== undefined && r.error.kind === 'zod_validation') {
    expect(r.error.issues[0]?.path).toBe(path)
  }
}

describe('Ratings explicit cases', () => {
  it('fully populated object parses', () => {
    const r = deserializeRatings(
      createRatings({
        chargeDescription: 'Weight charge',
        chargeType: 'WT',
        entitlement: 'C',
        otherChargeCode: 'MY',
        priceReferenceId: 'ref-1',
        priceSpecification: 'spec-1',
        quantity: 12.5,
        rcp: 'RCP',
        ranges: [{ rateClassCode: 'N', minimumQuantity: 0, maximumQuantity: 45 }],
      }),
    )
    expect(r.ok).toBe(true)
  })
  it('envelope-only parses', () => {
    expect(deserializeRatings(envelope('Ratings')).ok).toBe(true)
  })
  it('negative amounts accepted (credit lines)', () => {
    const r = deserializeRatings({ ...createRatings(), subTotal: -50, quantity: -1 })
    expect(r.ok).toBe(true)
  })
  it.each([
    ['billingChargeIdentifier', 'XX'],
    ['chargePaymentType', 'X'],
    ['entitlement', 'B'],
  ])('%s=%s -> zod_validation at that path', (field, value) => {
    expectKind(deserializeRatings({ ...createRatings(), [field]: value }), 'zod_validation', field)
  })
  it('embedded ranges ok', () => {
    expect(
      deserializeRatings({ ...createRatings(), ranges: [{ '@type': 'Ranges', unitBasis: 'KGM' }] })
        .ok,
    ).toBe(true)
  })
  it('ranges:[] -> cardinality_violation', () => {
    expectKind(deserializeRatings({ ...createRatings(), ranges: [] }), 'cardinality_violation')
  })
  it('ranges:[{foo:1}] -> zod_validation at ranges.0', () => {
    expectKind(
      deserializeRatings({ ...createRatings(), ranges: [{ foo: 1 }] }),
      'zod_validation',
      'ranges.0',
    )
  })
  it('forPrices with a non-https IRI -> invalid_iri', () => {
    expectKind(
      deserializeRatings({ ...createRatings(), forPrices: ['http://attacker'] }),
      'invalid_iri',
    )
  })
})
