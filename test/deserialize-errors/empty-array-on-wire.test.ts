import { describe, expect, it } from 'vitest'
import { deserializeShipment } from '../../src/classes/shipment/index.js'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createShipment } from '../factories/shipment.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> empty arrays on the wire (recursive rejection)', () => {
  it('rejects nested empty array deep inside object as cardinality_violation', () => {
    // findFirstEmptyArray walks depth-first before Zod, so the nested empty
    // array fires cardinality_violation even though the top-level keys are
    // also unknown under strict mode.
    const wire = {
      ...createWaybill(),
      nestedField: { deeplyNested: { someList: [] } },
    } as unknown
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('cardinality_violation')
    }
  })

  it('rejects empty array inside arrays of objects as cardinality_violation', () => {
    // findFirstEmptyArray walks into array elements — nestedExtra[0].inner is
    // an empty array and will be found before Zod validates the unknown key.
    const wire = {
      ...createShipment(),
      nestedExtra: [{ inner: [] }],
    } as unknown
    const r = deserializeShipment(wire)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      // nestedExtra[0].inner is empty — cardinality_violation fires pre-Zod
      expect(r.error.kind).toBe('cardinality_violation')
    }
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill({ ...createWaybill(), nestedField: { someList: [] } } as unknown, {
      meta: { requestId: 'rq1' },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
