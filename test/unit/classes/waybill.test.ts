import {
  WaybillCodec,
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
  serializeWaybillStrict,
} from '../../../src/classes/waybill/index.js'
import { createWaybill } from '../../factories/waybill.js'
import { roundTripHarness } from './_harness.js'

// v3 (A2-R2-M3): one-line invocation — replaces 8 hand-written assertions.
// The harness includes the invalid-iri assertion (proves A1-R2-B1 fix).
roundTripHarness({
  className: 'Waybill',
  schema: WaybillSchema,
  serialize: serializeWaybill,
  serializeStrict: serializeWaybillStrict,
  deserialize: deserializeWaybill,
  codec: WaybillCodec,
  factory: createWaybill,
  numericFields: { 'totalGrossWeight.value': 'weight' },
  emptyArrayField: 'referredBookingOption',
  invalidIriField: 'shipmentInformation',
})
