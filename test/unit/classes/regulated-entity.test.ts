import { describe, expect, it } from 'vitest'
import {
  RegulatedEntityCodec,
  RegulatedEntitySchema,
  deserializeRegulatedEntity,
  serializeRegulatedEntity,
  serializeRegulatedEntityStrict,
} from '../../../src/classes/regulated-entity/index.js'
import { createRegulatedEntity } from '../../factories/regulated-entity.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'RegulatedEntity',
  schema: RegulatedEntitySchema,
  serialize: serializeRegulatedEntity,
  serializeStrict: serializeRegulatedEntityStrict,
  deserialize: deserializeRegulatedEntity,
  codec: RegulatedEntityCodec,
  factory: createRegulatedEntity,
})

describe('RegulatedEntity 3.2-rc2 shape', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'RegulatedEntity',
    '@id': 'https://t.example/t/regulatedentity/1',
  }
  it('has owningOrganization + category code; rejects invented regulatedEntityIssuingAuthority', () => {
    expect(
      RegulatedEntitySchema.safeParse({
        ...base,
        owningOrganization: 'https://t.example/t/company/1',
        regulatedEntityCategory: 'RA',
        regulatedEntityIdentifier: 'GB/RA/00012345-1212',
        regulatedEntityExpiryDate: '2027-01-01T00:00:00.000Z',
      }).success,
    ).toBe(true)
    expect(
      RegulatedEntitySchema.safeParse({ ...base, regulatedEntityCategory: 'XX' }).success,
    ).toBe(false)
    expect(
      RegulatedEntitySchema.safeParse({ ...base, regulatedEntityIssuingAuthority: 'CAA' }).success,
    ).toBe(false)
  })
})
