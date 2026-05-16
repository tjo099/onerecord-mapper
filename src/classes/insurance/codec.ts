import type { Codec } from '../shared/codec.js'
import { deserializeInsurance } from './deserialize.js'
import type { Insurance, JsonLdInsurance } from './schema.js'
import { InsuranceSchema } from './schema.js'
import { serializeInsurance, serializeInsuranceStrict } from './serialize.js'

export const InsuranceCodec: Codec<Insurance, JsonLdInsurance, 'Insurance'> = Object.freeze({
  schema: InsuranceSchema,
  serialize: serializeInsurance,
  serializeStrict: serializeInsuranceStrict,
  deserialize: deserializeInsurance,
  type: 'Insurance',
} as const)
