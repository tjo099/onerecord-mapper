import { envelope } from './common.js'

export interface ServerInformationFactoryShape {
  '@context': string
  '@type': 'ServerInformation'
  '@id': string
  cargoOntologyVersion: string
  apiSpecVersion: string
}

export function createServerInformation(
  overrides: Partial<ServerInformationFactoryShape> = {},
): ServerInformationFactoryShape {
  return {
    ...envelope('ServerInformation'),
    '@type': 'ServerInformation',
    cargoOntologyVersion: '3.0.0',
    apiSpecVersion: '2.0.0',
    ...overrides,
  } as ServerInformationFactoryShape
}
