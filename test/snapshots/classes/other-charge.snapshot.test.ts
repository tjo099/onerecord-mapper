import { OtherChargeSchema, serializeOtherCharge } from '../../../src/classes/other-charge/index.js'
import { createOtherCharge } from '../../factories/other-charge.js'
import { snapshotHarness } from './_harness.js'
snapshotHarness({
  className: 'OtherCharge',
  schema: OtherChargeSchema,
  serialize: serializeOtherCharge,
  factory: createOtherCharge,
})
