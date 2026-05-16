import {
  WaybillLineItemCodec,
  WaybillLineItemSchema,
  deserializeWaybillLineItem,
  serializeWaybillLineItem,
  serializeWaybillLineItemStrict,
} from '../../../src/classes/waybill-line-item/index.js'
import { createWaybillLineItem } from '../../factories/waybill-line-item.js'
import { roundTripHarness } from './_harness.js'
roundTripHarness({
  className: 'WaybillLineItem',
  schema: WaybillLineItemSchema,
  serialize: serializeWaybillLineItem,
  serializeStrict: serializeWaybillLineItemStrict,
  deserialize: deserializeWaybillLineItem,
  codec: WaybillLineItemCodec,
  factory: createWaybillLineItem,
})
