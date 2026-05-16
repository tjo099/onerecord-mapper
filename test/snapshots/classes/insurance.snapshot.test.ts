import { InsuranceSchema, serializeInsurance } from '../../../src/classes/insurance/index.js'
import { createInsurance } from '../../factories/insurance.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Insurance',
  schema: InsuranceSchema,
  serialize: serializeInsurance,
  factory: createInsurance,
})
