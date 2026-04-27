// test/unit/coverage/class-completeness.test.ts
import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { EXPECTED_CLASS_COUNT } from '../../../src/factory-classes.js'

const CLASSES_DIR = join(process.cwd(), 'src/classes')
const UNIT_DIR = join(process.cwd(), 'test/unit/classes')
const SNAP_DIR = join(process.cwd(), 'test/snapshots/classes')

function classDirs(): string[] {
  return readdirSync(CLASSES_DIR).filter((d) => d !== 'shared')
}

describe('class-completeness (v3 — count derived from CLASSES map)', () => {
  it('every class directory has schema/serialize/deserialize/codec/index', () => {
    const missing: string[] = []
    for (const dir of classDirs()) {
      for (const f of ['schema.ts', 'serialize.ts', 'deserialize.ts', 'codec.ts', 'index.ts']) {
        const p = join(CLASSES_DIR, dir, f)
        if (!existsSync(p)) missing.push(p)
      }
    }
    if (missing.length > 0) throw new Error(`missing class source files:\n  ${missing.join('\n  ')}`)
    expect(missing).toHaveLength(0)
  })

  it('every class has unit round-trip + snapshot test', () => {
    const missing: string[] = []
    for (const dir of classDirs()) {
      // Support both flat layout (dir.test.ts) and nested layout (dir/dir.test.ts)
      const unitFlat = join(UNIT_DIR, `${dir}.test.ts`)
      const unitNested = join(UNIT_DIR, dir, `${dir}.test.ts`)
      if (!existsSync(unitFlat) && !existsSync(unitNested)) missing.push(unitFlat)
      const snapFile = join(SNAP_DIR, `${dir}.snapshot.test.ts`)
      if (!existsSync(snapFile)) missing.push(snapFile)
    }
    if (missing.length > 0) throw new Error(`missing class tests:\n  ${missing.join('\n  ')}`)
    expect(missing).toHaveLength(0)
  })

  it(`there are exactly EXPECTED_CLASS_COUNT (${EXPECTED_CLASS_COUNT}) class directories (v3 — A2-R2-N4)`, () => {
    expect(classDirs()).toHaveLength(EXPECTED_CLASS_COUNT)
  })
})
