import { CompanySchema, serializeCompany } from '../../../src/classes/company/index.js'
import { createCompany } from '../../factories/company.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Company',
  schema: CompanySchema,
  serialize: serializeCompany,
  factory: createCompany,
})
