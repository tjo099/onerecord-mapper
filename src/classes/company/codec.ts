import type { Codec } from '../shared/codec.js'
import { deserializeCompany } from './deserialize.js'
import type { Company, JsonLdCompany } from './schema.js'
import { CompanySchema } from './schema.js'
import { serializeCompany, serializeCompanyStrict } from './serialize.js'

export const CompanyCodec: Codec<Company, JsonLdCompany, 'Company'> = Object.freeze({
  schema: CompanySchema,
  serialize: serializeCompany,
  serializeStrict: serializeCompanyStrict,
  deserialize: deserializeCompany,
  type: 'Company',
} as const)
