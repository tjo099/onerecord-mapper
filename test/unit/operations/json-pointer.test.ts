import { describe, expect, it } from 'vitest'
import { asJsonPointer, splitPointer } from '../../../src/operations/json-pointer.js'

describe('JSON-pointer helper', () => {
  it('accepts empty pointer (whole-document)', () => {
    const r = asJsonPointer('')
    expect(r.ok).toBe(true)
  })

  it('accepts simple pointer /a/b', () => {
    const r = asJsonPointer('/a/b')
    expect(r.ok).toBe(true)
  })

  it('rejects pointer not starting with / (and not empty)', () => {
    const r = asJsonPointer('foo')
    expect(r.ok).toBe(false)
  })

  it('rejects pointer with __proto__ segment', () => {
    const r = asJsonPointer('/__proto__/x')
    expect(r.ok).toBe(false)
  })

  it('splitPointer returns [] for empty pointer', () => {
    const r = asJsonPointer('')
    expect(r.ok).toBe(true)
    if (r.ok) expect(splitPointer(r.value)).toStrictEqual([])
  })

  it('splitPointer splits /a/b into [a, b]', () => {
    const r = asJsonPointer('/a/b')
    expect(r.ok).toBe(true)
    if (r.ok) expect(splitPointer(r.value)).toStrictEqual(['a', 'b'])
  })

  it('splitPointer decodes ~1 -> / and ~0 -> ~ (RFC 6901)', () => {
    const r = asJsonPointer('/foo~1bar/baz~0qux')
    expect(r.ok).toBe(true)
    if (r.ok) expect(splitPointer(r.value)).toStrictEqual(['foo/bar', 'baz~qux'])
  })
})
