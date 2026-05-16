import { describe, expect, it } from 'vitest'
import { CustomsInformationCodec } from '../../src/classes/customs-information/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: CustomsInformation round-trip via NE:ONE Server (T1b.4)', () => {
  it.skipIf(!stackUp)(
    'POST then GET preserves CustomsInformation with single issuedForPiece IRI',
    async () => {
      const customsInformation = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'CustomsInformation',
        '@id': `https://test.flaks.example/test/customsinformation/contract-${Date.now()}`,
        ociLineNumber: 1,
        issuedForPiece: 'https://test.flaks.example/test/piece/contract-piece-1',
      }

      const wire = CustomsInformationCodec.serialize(customsInformation as never) as Record<
        string,
        unknown
      >
      const { iri, status } = await postLogisticsObject(wire)
      expect(status).toBe(201)

      const got = await getLogisticsObject(iri)
      expect(got['@type']).toBe('CustomsInformation')
      expect(got.ociLineNumber).toBe(1)
    },
  )
})
