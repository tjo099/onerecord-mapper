import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PARSE_ERROR_KINDS, PARSE_ERROR_KIND_TO_FILE } from '../../src/result.js'

const DIR = join(process.cwd(), 'test/deserialize-errors')

describe('deserialize-errors catalogue (v3)', () => {
  it('every ParseError kind maps to an existing test file (spec §7 + acceptance #5)', () => {
    const missing: string[] = []
    for (const kind of PARSE_ERROR_KINDS) {
      const file = PARSE_ERROR_KIND_TO_FILE[kind]
      const fullPath = join(DIR, file)
      if (!existsSync(fullPath)) {
        missing.push(`${kind} -> ${file}`)
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `missing deserialize-error test files (kind -> file):\n  ${missing.join('\n  ')}\n\nEither add the missing test files OR update PARSE_ERROR_KIND_TO_FILE in src/result.ts.`,
      )
    }
    expect(missing).toHaveLength(0)
  })

  it('produces a 19-file deduplicated set after collapsing (v0.2: 4 new files for deferral closures)', () => {
    const fileSet = new Set(Object.values(PARSE_ERROR_KIND_TO_FILE))
    expect(fileSet.size).toBe(19)
  })

  it('every file in the rename map has at least one kind pointing at it', () => {
    const reverseMap = new Map<string, string[]>()
    for (const kind of PARSE_ERROR_KINDS) {
      const file = PARSE_ERROR_KIND_TO_FILE[kind]
      const list = reverseMap.get(file) ?? []
      list.push(kind)
      reverseMap.set(file, list)
    }
    for (const [, kinds] of reverseMap.entries()) {
      expect(kinds.length).toBeGreaterThanOrEqual(1)
    }
  })
})
