import {
  InsuranceCodec,
  InsuranceSchema,
  deserializeInsurance,
  serializeInsurance,
  serializeInsuranceStrict,
} from '../../../src/classes/insurance/index.js'
import { createInsurance } from '../../factories/insurance.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Insurance',
  schema: InsuranceSchema,
  serialize: serializeInsurance,
  serializeStrict: serializeInsuranceStrict,
  deserialize: deserializeInsurance,
  codec: InsuranceCodec,
  factory: createInsurance,
})
