import { describe, expect, it } from 'vitest'
import { deepFreeze } from '../../../src/util/deep-freeze.js'

describe('deepFreeze', () => {
  it('freezes nested objects (3 levels)', () => {
    const obj = { a: { b: { c: 1 } } }
    deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(obj.a)).toBe(true)
    expect(Object.isFrozen(obj.a.b)).toBe(true)
  })

  it('freezes arrays + their objects', () => {
    const obj = { list: [{ x: 1 }, { x: 2 }] }
    deepFreeze(obj)
    expect(Object.isFrozen(obj.list)).toBe(true)
    expect(Object.isFrozen(obj.list[0])).toBe(true)
  })

  it('is idempotent', () => {
    const obj = { a: 1 }
    expect(deepFreeze(deepFreeze(obj))).toBe(obj)
  })
})
