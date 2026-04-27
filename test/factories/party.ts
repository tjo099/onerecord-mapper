import type { Party } from '../../src/classes/party/schema.js'
import { envelope } from './common.js'

export type PartyFactoryShape = Party

export function createParty(overrides: Partial<PartyFactoryShape> = {}): PartyFactoryShape {
  return {
    ...envelope('Party'),
    '@type': 'Party',
    partyRole: 'SHP',
    partyDetails: 'https://example.org/party/details/1',
    ...overrides,
  } as PartyFactoryShape
}
