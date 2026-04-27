import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
} from '../../src/classes/waybill/index.js'
import { fieldEquivalent } from '../util/field-equivalent.js'

const FIXTURE_PATH = join(
  process.cwd(),
  'test/fixtures/samples-synthetic/synthetic-fwb-1.expected.json',
)

describe('synthetic FWB round-trip (Phase 12)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    const expected = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))
    const wb = WaybillSchema.parse(expected)
    const r = deserializeWaybill(serializeWaybill(wb))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(
        fieldEquivalent(r.value, wb, {
          numericFields: { 'totalGrossWeight.value': 'weight' },
        }),
      ).toBe(true)
    }
  })

  it('the fixture parses cleanly through WaybillSchema', () => {
    const expected = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))
    const result = WaybillSchema.safeParse(expected)
    expect(result.success).toBe(true)
  })

  it('the fixture survives deserialize+serialize without IRI mutation', () => {
    const expected = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))
    const wb = WaybillSchema.parse(expected)
    const wire = serializeWaybill(wb)
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value['@id']).toBe(expected['@id'])
      expect(r.value.shipmentInformation).toBe(expected.shipmentInformation)
      expect(r.value.referredBookingOption).toBe(expected.referredBookingOption)
    }
  })
})
