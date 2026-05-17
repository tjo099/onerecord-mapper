import { describe, expect, it } from 'vitest'
import {
  WaybillLineItemCodec,
  WaybillLineItemSchema,
  deserializeWaybillLineItem,
  serializeWaybillLineItem,
  serializeWaybillLineItemStrict,
} from '../../../src/classes/waybill-line-item/index.js'
import { CARGO_CONTEXT_IRI } from '../../../src/version.js'
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

describe('WaybillLineItem.uldReferences → :ULD (T1b.11)', () => {
  it('accepts uldReferences array of ULD IRIs', () => {
    expect(
      WaybillLineItemSchema.safeParse({
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'WaybillLineItem',
        '@id': 'https://t.example/t/waybilllineitem/1',
        lineItemNumber: 1,
        uldReferences: ['https://t.example/t/uld/1'],
      }).success,
    ).toBe(true)
  })
})
