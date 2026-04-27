import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const AddressSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Address'),
  streetAddressLines: z.array(z.string().max(70)).max(3),
  cityName: z.string().max(35),
  postalCode: z.string().max(17).optional(),
  country: z.object({ countryCode: z.string().length(2) }),
  regionName: z.string().max(35).optional(),
}).strict()

export type Address = z.infer<typeof AddressSchema>
export type JsonLdAddress = JsonLd<'Address'>
