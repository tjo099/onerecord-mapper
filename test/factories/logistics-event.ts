import type { LogisticsEvent } from '../../src/classes/logistics-event/schema.js'
import { envelope } from './common.js'

export type LogisticsEventFactoryShape = LogisticsEvent

export function createLogisticsEvent(
  overrides: Partial<LogisticsEventFactoryShape> = {},
): LogisticsEventFactoryShape {
  return {
    ...envelope('LogisticsEvent'),
    '@type': 'LogisticsEvent',
    eventTypeCode: 'RCS',
    eventTimestamp: '2026-01-01T12:00:00.000Z',
    ...overrides,
  } as LogisticsEventFactoryShape
}
