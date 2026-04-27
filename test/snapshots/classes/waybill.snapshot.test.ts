import { WaybillSchema, serializeWaybill } from '../../../src/classes/waybill/index.js'
import { createWaybill } from '../../factories/waybill.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Waybill',
  schema: WaybillSchema,
  serialize: serializeWaybill,
  factory: createWaybill,
})
