import type { Notification } from '../../src/classes/notification/schema.js'
import { envelope } from './common.js'

export type NotificationFactoryShape = Notification

export function createNotification(
  overrides: Partial<NotificationFactoryShape> = {},
): NotificationFactoryShape {
  return {
    ...envelope('Notification'),
    '@type': 'Notification',
    eventType: 'OBJECT_CREATED',
    eventTimestamp: '2026-01-01T12:00:00.000Z',
    relatedLogisticsObject: 'https://example.org/waybill/123',
    ...overrides,
  } as NotificationFactoryShape
}
