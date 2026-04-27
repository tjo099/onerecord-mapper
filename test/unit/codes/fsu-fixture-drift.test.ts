import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FSU_EVENT_CODES } from '../../../src/codes/fsu-event-codes.js'

const FIXTURE_PATH = join(process.cwd(), 'test/fixtures/iata/xfsu-status-codes.json')

describe('FSU fixture drift detection (T77)', () => {
  it('FSU_EVENT_CODES const matches the xlsx fixture exactly', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as {
      codes: string[]
      pinnedSha: string
    }
    const constKeys = Object.keys(FSU_EVENT_CODES).sort()
    const fixtureCodes = [...fixture.codes].sort()
    expect(constKeys).toStrictEqual(fixtureCodes)
  })

  it('fixture has a pinnedSha (manually-pinned-v0.1.0 OR upstream sha256:...)', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as {
      pinnedSha: string
    }
    expect(fixture.pinnedSha).toMatch(/^(manually-pinned-v0\.1\.0|sha256:[a-f0-9]{64})$/)
  })

  it('fixture documents its source URL (IATA-Cargo working_draft)', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as {
      source: string
    }
    expect(fixture.source).toContain('IATA-Cargo/ONE-Record')
  })
})
