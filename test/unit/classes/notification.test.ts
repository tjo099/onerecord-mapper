import {
  NotificationCodec,
  NotificationSchema,
  deserializeNotification,
  serializeNotification,
  serializeNotificationStrict,
} from '../../../src/classes/notification/index.js'
import { createNotification } from '../../factories/notification.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Notification',
  schema: NotificationSchema,
  serialize: serializeNotification,
  serializeStrict: serializeNotificationStrict,
  deserialize: deserializeNotification,
  codec: NotificationCodec,
  factory: createNotification,
  invalidIriField: 'relatedLogisticsObject',
})
