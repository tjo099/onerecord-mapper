import type { Codec } from '../shared/codec.js'
import { deserializeNotification } from './deserialize.js'
import type { JsonLdNotification, Notification } from './schema.js'
import { NotificationSchema } from './schema.js'
import { serializeNotification, serializeNotificationStrict } from './serialize.js'

export const NotificationCodec: Codec<Notification, JsonLdNotification, 'Notification'> =
  Object.freeze({
    schema: NotificationSchema,
    serialize: serializeNotification,
    serializeStrict: serializeNotificationStrict,
    deserialize: deserializeNotification,
    type: 'Notification',
  } as const)
