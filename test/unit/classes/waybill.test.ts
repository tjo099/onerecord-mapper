import { describe, expect, it } from 'vitest'
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
// 1b.8: numericFields removed (totalGrossWeight dropped); invalidIriField moved
//       from shipmentInformation (removed) to shipment (new spec field).
roundTripHarness({
  className: 'Waybill',
  schema: WaybillSchema,
  serialize: serializeWaybill,
  serializeStrict: serializeWaybillStrict,
  deserialize: deserializeWaybill,
  codec: WaybillCodec,
  factory: createWaybill,
  emptyArrayField: 'referredBookingOption',
  invalidIriField: 'shipment',
})

describe('Waybill Path A', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'Waybill',
    '@id': 'https://t.example/t/waybill/1',
    waybillPrefix: '701',
    waybillNumber: '90061521',
  }
  it('drops shipmentInformation + totalGrossWeight, accepts spec keys + DIRECT', () => {
    expect(
      WaybillSchema.safeParse({
        ...base,
        waybillType: 'MASTER',
        shipmentInformation: 'https://t.example/t/s/1',
      }).success,
    ).toBe(false)
    expect(
      WaybillSchema.safeParse({
        ...base,
        waybillType: 'MASTER',
        totalGrossWeight: { unit: 'KGM', value: 1 },
      }).success,
    ).toBe(false)
    expect(
      WaybillSchema.safeParse({
        ...base,
        waybillType: 'DIRECT',
        shipment: 'https://t.example/t/shipment/1',
        departureLocation: 'https://t.example/t/location/ABZ',
        involvedParties: ['https://t.example/t/party/1'],
        waybillLineItems: ['https://t.example/t/waybilllineitem/1'],
        otherCharges: ['https://t.example/t/othercharge/1'],
        declaredValueForCarriage: { numericalValue: 1000, currencyUnit: 'NOK' },
        declaredValueForCustoms: { numericalValue: 1000, currencyUnit: 'NOK' },
        carrierDeclarationDate: '2026-04-26T10:00:00.000Z',
        carrierDeclarationPlace: 'https://t.example/t/location/ABZ',
        carrierDeclarationSignature: 'J.Doe',
        consignorDeclarationSignature: 'A.Shipper',
        accountingInformation: 'COLL FRT',
        houseWaybills: ['https://t.example/t/waybill/2'],
        masterWaybill: 'https://t.example/t/waybill/3',
        shippingRefNo: 'REF42',
      }).success,
    ).toBe(true)
  })
  it('accepts alphanumeric waybillNumber per spec pattern [A-Z0-9]+', () => {
    expect(
      WaybillSchema.safeParse({ ...base, waybillNumber: '9006A521', waybillType: 'MASTER' })
        .success,
    ).toBe(true)
  })
})
