import { describe, expect, it } from 'vitest'
import { SecurityDeclarationCodec } from '../../src/classes/security-declaration/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: SecurityDeclaration round-trip via NE:ONE Server', () => {
  it.skipIf(!stackUp)(
    'POST then GET preserves SecurityDeclaration with securityStatus',
    async () => {
      const sd = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'SecurityDeclaration',
        '@id': `https://test.flaks.example/test/security-declaration/contract-${Date.now()}`,
        securityStatus: 'SPX',
        screeningMethods: ['XRY'],
        issuedOn: '2026-04-30T08:00:00.000Z',
      }

      const wire = SecurityDeclarationCodec.serialize(sd as never) as Record<string, unknown>
      const { iri, status } = await postLogisticsObject(wire)
      expect(status).toBe(201)

      const got = await getLogisticsObject(iri)
      expect(got['@type']).toBe('SecurityDeclaration')
    },
  )
})
