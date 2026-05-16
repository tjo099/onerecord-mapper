import {
  CompanyCodec,
  CompanySchema,
  deserializeCompany,
  serializeCompany,
  serializeCompanyStrict,
} from '../../../src/classes/company/index.js'
import { createCompany } from '../../factories/company.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Company',
  schema: CompanySchema,
  serialize: serializeCompany,
  serializeStrict: serializeCompanyStrict,
  deserialize: deserializeCompany,
  codec: CompanyCodec,
  factory: createCompany,
})
