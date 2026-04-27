import { envelope } from './common.js'

export interface LogisticsEventFactoryShape {
  '@context': string
  '@type': 'LogisticsEvent'
  '@id': string
  eventTypeCode: string
  eventTimestamp: string
}

export function createLogisticsEvent(
  overrides: Partial<LogisticsEventFactoryShape> = {},
): LogisticsEventFactoryShape {
  return {
    ...envelope('LogisticsEvent'),
    '@type': 'LogisticsEvent',
    eventTypeCode: 'DEP',
    eventTimestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as LogisticsEventFactoryShape
}
