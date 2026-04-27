import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const PersonSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Person'),
  firstName: z.string().max(35),
  lastName: z.string().max(35),
  salutation: z.string().max(10).optional(),
  contactPhone: z.string().max(35).optional(),
  contactEmail: z.string().email().optional(),
}).strict()

export type Person = z.infer<typeof PersonSchema>
export type JsonLdPerson = JsonLd<'Person'>
