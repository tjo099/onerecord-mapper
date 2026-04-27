import { envelope } from './common.js'

export interface NotificationFactoryShape {
  '@context': string
  '@type': 'Notification'
  '@id': string
  eventType: 'LOGISTICS_OBJECT_CREATED' | 'LOGISTICS_OBJECT_UPDATED' | 'LOGISTICS_OBJECT_LIFECYCLE'
  notificationFor: string
}

export function createNotification(
  overrides: Partial<NotificationFactoryShape> = {},
): NotificationFactoryShape {
  return {
    ...envelope('Notification'),
    '@type': 'Notification',
    eventType: 'LOGISTICS_OBJECT_UPDATED',
    notificationFor: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as NotificationFactoryShape
}
