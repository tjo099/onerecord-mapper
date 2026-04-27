import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const NotificationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Notification'),
  eventType: z.enum(['OBJECT_CREATED', 'OBJECT_UPDATED', 'LOGISTICS_EVENT_RECEIVED']),
  eventTimestamp: z.string().datetime({ offset: true }),
  relatedLogisticsObject: safeIri(),
  notificationBody: z.unknown().optional(),
}).strict()

export type Notification = z.infer<typeof NotificationSchema>
export type JsonLdNotification = JsonLd<'Notification'>
