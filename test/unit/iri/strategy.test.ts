// test/unit/iri/strategy.test.ts
import { describe, expect, expectTypeOf, it } from 'vitest'
import type { IriParts, IriStrategy, SafeIri } from '../../../src/iri/strategy.js'

describe('IriStrategy', () => {
  it('SafeIri is a branded string', () => {
    expectTypeOf<SafeIri>().toBeString()
    // Plain string cannot be assigned to SafeIri
    // @ts-expect-error — branded type rejects raw strings
    const safe: SafeIri = 'https://example.com/x'
    expect(typeof safe).toBe('string')
  })

  it('IriParts requires tenant + uuid; host optional', () => {
    const parts: IriParts = { tenant: 't1', uuid: 'u1' }
    const partsWithHost: IriParts = { tenant: 't1', uuid: 'u1', host: 'example.com' }
    expect(parts.tenant).toBe('t1')
    expect(partsWithHost.host).toBe('example.com')
  })

  it('IriStrategy.build returns a SafeIri', () => {
    const strat: IriStrategy = {
      allowedSchemes: ['https'],
      build: (className, parts) =>
        `https://${parts.host ?? 'flaks.example'}/${parts.tenant}/${className.toLowerCase()}/${parts.uuid}` as SafeIri,
    }
    const iri = strat.build('Waybill', { tenant: 't1', uuid: 'u1' })
    expect(iri).toBe('https://flaks.example/t1/waybill/u1')
  })
})
