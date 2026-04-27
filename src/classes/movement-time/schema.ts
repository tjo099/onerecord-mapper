import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const MovementTimeSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('MovementTime'),
  movementTimeType: z.enum(['SCHEDULED', 'ESTIMATED', 'ACTUAL']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  movementTimestamp: z.string().datetime({ offset: true }),
}).strict()

export type MovementTime = z.infer<typeof MovementTimeSchema>
export type JsonLdMovementTime = JsonLd<'MovementTime'>
