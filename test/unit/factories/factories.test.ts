import { describe, expect, it } from 'vitest'
import { EXPECTED_CLASS_COUNT } from '../../../src/factory-classes.js'
import { snapshotFixtureFor } from '../../factories/common.js'
import * as factories from '../../factories/index.js'
import { createWaybill } from '../../factories/waybill.js'

describe('createWaybill factory', () => {
  it('produces a minimal valid envelope by default', () => {
    const wb = createWaybill()
    expect(wb['@context']).toBe('https://onerecord.iata.org/ns/cargo')
    expect(wb['@type']).toBe('Waybill')
    expect(wb['@id']).toMatch(/^https:\/\//)
    expect(wb.waybillType).toBe('MASTER')
  })

  it('overrides shallow fields', () => {
    const wb = createWaybill({ waybillType: 'HOUSE' })
    expect(wb.waybillType).toBe('HOUSE')
  })

  it('produces a stable IRI shape', () => {
    const a = createWaybill()
    const b = createWaybill()
    expect(a['@id']).not.toBe(b['@id'])
    expect(a['@id']).toMatch(
      /^https:\/\/test\.flaks\.example\/test-tenant\/waybill\/[0-9a-f-]{36}$/,
    )
  })

  it('snapshotFixtureFor produces deterministic @id + dates (v2)', () => {
    const a = snapshotFixtureFor('Waybill', createWaybill)
    const b = snapshotFixtureFor('Waybill', createWaybill)
    expect(a['@id']).toBe('https://snapshot.example/wf/waybill/fixed-id')
    expect(a['@id']).toBe(b['@id'])
  })

  it('exposes one create-factory per registered class (count auto-derived from CLASSES)', () => {
    const names = Object.keys(factories).filter((k) => k.startsWith('create'))
    // Never a literal count — derive from EXPECTED_CLASS_COUNT so adding a
    // class that lacks a factory is caught automatically (F12 rule).
    expect(names).toHaveLength(EXPECTED_CLASS_COUNT)
  })
})
