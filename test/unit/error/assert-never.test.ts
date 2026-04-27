// test/unit/error/assert-never.test.ts
import { describe, expect, it } from 'vitest'
import { assertNever } from '../../../src/error/assert-never.js'

describe('assertNever', () => {
  it('throws when called at runtime with a value escaping the type system', () => {
    const leaked = 'unexpected' as never
    expect(() => assertNever(leaked)).toThrow(/exhaustiveness check failed.*"unexpected"/)
  })

  it('produces an Error with structured details', () => {
    try {
      assertNever('x' as never)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).message).toContain('exhaustiveness check failed')
    }
  })
})
