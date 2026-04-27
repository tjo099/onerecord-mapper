import { NotificationSchema, serializeNotification } from '../../../src/classes/notification/index.js'
import { createNotification } from '../../factories/notification.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Notification',
  schema: NotificationSchema,
  serialize: serializeNotification,
  factory: createNotification,
})
