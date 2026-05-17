import { describe, expect, it } from 'vitest'
import { ULDCodec } from '../../src/classes/uld/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: ULD round-trip via NE:ONE Server (T1b.11)', () => {
  it.skipIf(!stackUp)('POST then GET preserves ULD with uldTypeCode AKE', async () => {
    const uld = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'ULD',
      '@id': `https://test.flaks.example/test/uld/contract-${Date.now()}`,
      uldTypeCode: 'AKE',
    }

    const wire = ULDCodec.serialize(uld as never) as Record<string, unknown>
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)

    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('ULD')
    expect(got.uldTypeCode).toBe('AKE')
  })
})
