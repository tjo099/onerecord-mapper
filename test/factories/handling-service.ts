import type { HandlingService } from '../../src/classes/handling-service/schema.js'
import { envelope } from './common.js'

export type HandlingServiceFactoryShape = HandlingService

export function createHandlingService(
  overrides: Partial<HandlingServiceFactoryShape> = {},
): HandlingServiceFactoryShape {
  return {
    ...envelope('HandlingService'),
    '@type': 'HandlingService',
    serviceType: 'CARGO_HANDLING',
    description: 'General cargo handling service',
    ...overrides,
  } as HandlingServiceFactoryShape
}
