import type { ServerInformation } from '../../src/classes/server-information/schema.js'
import { envelope } from './common.js'

export type ServerInformationFactoryShape = ServerInformation

export function createServerInformation(
  overrides: Partial<ServerInformationFactoryShape> = {},
): ServerInformationFactoryShape {
  return {
    ...envelope('ServerInformation'),
    '@type': 'ServerInformation',
    serverEndpoint: 'https://example.org/server',
    cargoOntologyVersion: '3.2',
    apiSpecVersion: '2.2.0',
    ...overrides,
  } as ServerInformationFactoryShape
}
