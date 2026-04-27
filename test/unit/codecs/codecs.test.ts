// test/unit/codecs/codecs.test.ts
import { describe, expect, it } from 'vitest'
import * as Codecs from '../../../src/codecs.js'
import { CLASSES, EXPECTED_CLASS_COUNT } from '../../../src/factory-classes.js'

describe('codecs subpath barrel', () => {
  it('exports all 32 individual codec values', () => {
    const codecNames = Object.keys(CLASSES).map((c) => `${c}Codec`)
    for (const name of codecNames) {
      expect(typeof (Codecs as Record<string, unknown>)[name], `${name} should be exported`).toBe(
        'object',
      )
      expect((Codecs as Record<string, unknown>)[name], `${name} should be truthy`).toBeTruthy()
    }
  })

  it('CODECS frozen map has exactly EXPECTED_CLASS_COUNT entries', () => {
    expect(Object.keys(Codecs.CODECS)).toHaveLength(EXPECTED_CLASS_COUNT)
  })

  it('CODECS map is frozen', () => {
    expect(Object.isFrozen(Codecs.CODECS)).toBe(true)
  })

  it('each CODECS entry is non-null and has a deserialize method', () => {
    const missing: string[] = []
    for (const [name, codec] of Object.entries(Codecs.CODECS)) {
      if (!codec || typeof (codec as Record<string, unknown>).deserialize !== 'function') {
        missing.push(name)
      }
    }
    expect(missing).toHaveLength(0)
  })

  it('each CODECS entry has serialize and serializeStrict methods', () => {
    const missing: string[] = []
    for (const [name, codec] of Object.entries(Codecs.CODECS)) {
      const c = codec as Record<string, unknown>
      if (typeof c.serialize !== 'function' || typeof c.serializeStrict !== 'function') {
        missing.push(name)
      }
    }
    expect(missing).toHaveLength(0)
  })

  it('each CODECS entry has a type discriminator matching its class name', () => {
    const mismatches: string[] = []
    for (const [name, codec] of Object.entries(Codecs.CODECS)) {
      const c = codec as Record<string, unknown>
      if (c.type !== name) {
        mismatches.push(`${name}: got ${String(c.type)}`)
      }
    }
    expect(mismatches).toHaveLength(0)
  })
})
