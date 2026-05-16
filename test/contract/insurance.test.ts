import { describe, expect, it } from 'vitest'
import { InsuranceCodec } from '../../src/classes/insurance/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: Insurance round-trip via NE:ONE Server (T1b.5)', () => {
  it.skipIf(!stackUp)(
    'POST then GET preserves Insurance with insuredAmount and coveringOrganization',
    async () => {
      const insurance = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Insurance',
        '@id': `https://test.flaks.example/test/insurance/contract-${Date.now()}`,
        insuredAmount: { numericalValue: 1000, currencyUnit: 'NOK' },
        coveringOrganization: 'https://test.flaks.example/test/company/contract-insurer-1',
      }

      const wire = InsuranceCodec.serialize(insurance as never) as Record<string, unknown>
      const { iri, status } = await postLogisticsObject(wire)
      expect(status).toBe(201)

      const got = await getLogisticsObject(iri)
      expect(got['@type']).toBe('Insurance')
      expect((got.insuredAmount as Record<string, unknown>)?.numericalValue).toBe(1000)
    },
  )
})
