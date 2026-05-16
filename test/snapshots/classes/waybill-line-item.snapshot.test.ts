import { WaybillLineItemSchema, serializeWaybillLineItem } from '../../../src/classes/waybill-line-item/index.js'
import { createWaybillLineItem } from '../../factories/waybill-line-item.js'
import { snapshotHarness } from './_harness.js'
snapshotHarness({ className: 'WaybillLineItem', schema: WaybillLineItemSchema, serialize: serializeWaybillLineItem, factory: createWaybillLineItem })
