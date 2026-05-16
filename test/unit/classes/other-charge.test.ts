import {
  OtherChargeCodec,
  OtherChargeSchema,
  deserializeOtherCharge,
  serializeOtherCharge,
  serializeOtherChargeStrict,
} from '../../../src/classes/other-charge/index.js'
import { createOtherCharge } from '../../factories/other-charge.js'
import { roundTripHarness } from './_harness.js'
roundTripHarness({
  className: 'OtherCharge',
  schema: OtherChargeSchema,
  serialize: serializeOtherCharge,
  serializeStrict: serializeOtherChargeStrict,
  deserialize: deserializeOtherCharge,
  codec: OtherChargeCodec,
  factory: createOtherCharge,
})
