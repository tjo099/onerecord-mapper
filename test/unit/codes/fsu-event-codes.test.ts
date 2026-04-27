import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FSU_EVENT_CODES, fsuCodeToEventTypeCode } from '../../../src/codes/fsu-event-codes.js'

const FIXTURE = JSON.parse(
  readFileSync(join(process.cwd(), 'test/fixtures/iata/xfsu-status-codes.json'), 'utf8'),
) as { codes: string[]; pinnedSha: string }

describe('FSU_EVENT_CODES (v2 — backed by xlsx fixture)', () => {
  it('contains exactly the codes from the canonical IATA xlsx', () => {
    const keys = Object.keys(FSU_EVENT_CODES).sort()
    const expected = [...FIXTURE.codes].sort()
    expect(keys).toStrictEqual(expected)
  })

  it('contains exactly 26 codes per spec acceptance #2', () => {
    expect(Object.keys(FSU_EVENT_CODES)).toHaveLength(26)
    expect(FIXTURE.codes).toHaveLength(26)
  })

  it('maps the canonical sample codes', () => {
    for (const sample of ['RCS', 'DEP', 'ARR', 'DLV', 'FOH', 'RCF']) {
      expect(fsuCodeToEventTypeCode(sample as 'RCS' | 'DEP' | 'ARR' | 'DLV' | 'FOH' | 'RCF')).toBe(
        sample,
      )
    }
  })

  it('mapping is identity for v0.1.0 (documented in CHANGELOG)', () => {
    for (const code of FIXTURE.codes) {
      expect(fsuCodeToEventTypeCode(code as 'RCS')).toBe(code)
    }
  })
})
