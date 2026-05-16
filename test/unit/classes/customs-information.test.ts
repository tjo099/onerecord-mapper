import { describe, expect, it } from 'vitest'
import { CustomsInformationSchema } from '../../../src/classes/customs-information/schema.js'

describe('CustomsInformation OCI cardinality (R2-2 — maxCardinality 1, NOT array)', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'CustomsInformation',
    '@id': 'https://t.example/t/customsinformation/1',
  }

  it('accepts single-IRI issuedForPiece/issuedForShipment', () => {
    expect(
      CustomsInformationSchema.safeParse({
        ...base,
        ociLineNumber: 1,
        issuedForPiece: 'https://t.example/t/piece/1',
        issuedForShipment: 'https://t.example/t/shipment/1',
      }).success,
    ).toBe(true)
  })

  it('REJECTS array issuedForPiece (maxCardinality 1)', () => {
    expect(
      CustomsInformationSchema.safeParse({
        ...base,
        issuedForPiece: ['https://t.example/t/piece/1', 'https://t.example/t/piece/2'],
      }).success,
    ).toBe(false)
  })

  it('REJECTS array issuedForShipment (maxCardinality 1)', () => {
    expect(
      CustomsInformationSchema.safeParse({
        ...base,
        issuedForShipment: ['https://t.example/t/shipment/1', 'https://t.example/t/shipment/2'],
      }).success,
    ).toBe(false)
  })
})

import {
  CustomsInformationCodec,
  deserializeCustomsInformation,
  serializeCustomsInformation,
  serializeCustomsInformationStrict,
} from '../../../src/classes/customs-information/index.js'
import { createCustomsInformation } from '../../factories/customs-information.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'CustomsInformation',
  schema: CustomsInformationSchema,
  serialize: serializeCustomsInformation,
  serializeStrict: serializeCustomsInformationStrict,
  deserialize: deserializeCustomsInformation,
  codec: CustomsInformationCodec,
  factory: createCustomsInformation,
})
