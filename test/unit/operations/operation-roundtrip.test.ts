import { describe, expect, it } from 'vitest'
import { ChangeSchema } from '../../../src/classes/change/index.js'
import { OperationSchema } from '../../../src/classes/operation/index.js'
import { WaybillCodec, WaybillSchema } from '../../../src/classes/waybill/index.js'
import { applyChange } from '../../../src/operations/apply-change.js'
import { createWaybill } from '../../factories/waybill.js'

describe('Operation/Change schema <-> applyChange integration (v3 — closes A2-M7 PARTIAL)', () => {
  it('parses Change + Operation through schema, then applies', () => {
    const wb = WaybillSchema.parse(createWaybill())
    const change = ChangeSchema.parse({
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Change',
      '@id': 'https://test.flaks.example/test-tenant/change/c1',
      hasOperation: [
        {
          '@context': 'https://onerecord.iata.org/ns/cargo',
          '@type': 'Operation',
          '@id': 'https://test.flaks.example/test-tenant/operation/o1',
          op: 'ADD',
          path: '/totalGrossWeight',
          value: { unit: 'KGM', value: 100 },
        },
      ],
    })
    // Pass parsed Operations into applyChange directly (no field-by-field copy).
    // This proves OperationLike (apply-change input type) is structurally
    // compatible with the parsed Operation shape.
    const r = applyChange(WaybillCodec, wb, { hasOperation: change.hasOperation })
    expect(r.ok).toBe(true)
  })

  it('parsed Operation preserves all schema fields (no degraded contract)', () => {
    const op = OperationSchema.parse({
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Operation',
      '@id': 'https://test.flaks.example/test-tenant/operation/o2',
      op: 'DELETE',
      path: '/totalGrossWeight',
    })
    expect(op.op).toBe('DELETE')
    expect(op.path).toBe('/totalGrossWeight')
    expect(op.value).toBeUndefined()
  })
})
