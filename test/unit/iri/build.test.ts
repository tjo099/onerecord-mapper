// test/unit/iri/build.test.ts
import { describe, expect, it } from 'vitest'
import { buildIri } from '../../../src/iri/build.js'
import { defaultIriStrategy } from '../../../src/iri/default-strategy.js'

describe('defaultIriStrategy', () => {
  it('builds an https IRI in the {host}/{tenant}/{class}/{uuid} shape', () => {
    const iri = defaultIriStrategy.build('Waybill', {
      tenant: 'wf',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      host: 'flaks.example',
    })
    expect(iri).toBe('https://flaks.example/wf/waybill/550e8400-e29b-41d4-a716-446655440000')
  })

  it('throws SerializationError when host is missing AND no fallback configured', () => {
    expect(() => defaultIriStrategy.build('Waybill', { tenant: 'wf', uuid: 'u1' })).toThrow(
      /host.*required/,
    )
  })
})

describe('buildIri', () => {
  it('delegates to the provided strategy', () => {
    const iri = buildIri(
      'Shipment',
      { tenant: 't1', uuid: 'u1', host: 'example.com' },
      defaultIriStrategy,
    )
    expect(iri).toBe('https://example.com/t1/shipment/u1')
  })

  it('uses defaultIriStrategy when no strategy passed', () => {
    const iri = buildIri('Piece', { tenant: 't1', uuid: 'u1', host: 'example.com' })
    expect(iri).toMatch(/^https:\/\/example\.com\/t1\/piece\/u1$/)
  })

  it('the resulting IRI passes validateIri with default policy', async () => {
    const { validateIri } = await import('../../../src/iri/validate.js')
    const iri = buildIri('Waybill', { tenant: 't1', uuid: 'u1', host: 'flaks.example' })
    const r = validateIri(iri)
    expect(r.ok).toBe(true)
  })
})
