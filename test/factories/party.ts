import { envelope } from './common.js'

export interface PartyFactoryShape {
  '@context': string
  '@type': 'Party'
  '@id': string
  partyRole: 'SHP' | 'CNE' | 'FFW' | 'CAR' | 'NFY' | 'AGT' | 'GHA'
  partyDetails: string
}

export function createParty(overrides: Partial<PartyFactoryShape> = {}): PartyFactoryShape {
  return {
    ...envelope('Party'),
    '@type': 'Party',
    partyRole: 'SHP',
    partyDetails: 'https://example/organization/shipper',
    ...overrides,
  } as PartyFactoryShape
}
