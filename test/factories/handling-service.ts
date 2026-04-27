import { envelope } from './common.js'

export interface HandlingServiceFactoryShape {
  '@context': string
  '@type': 'HandlingService'
  '@id': string
  serviceType: string
  provider?: string
}

export function createHandlingService(
  overrides: Partial<HandlingServiceFactoryShape> = {},
): HandlingServiceFactoryShape {
  return {
    ...envelope('HandlingService'),
    '@type': 'HandlingService',
    serviceType: 'GROUND_HANDLING',
    provider: 'https://example/organization/gha',
    ...overrides,
  } as HandlingServiceFactoryShape
}
