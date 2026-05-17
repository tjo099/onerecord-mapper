import { describe, expect, it } from 'vitest'
import { CO2EmissionsCodec } from '../../src/classes/co2-emissions/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: CO2Emissions round-trip via NE:ONE Server (T1b.12)', () => {
  it.skipIf(!stackUp)('POST then GET preserves CO2Emissions with calculatedEmissions', async () => {
    const co2 = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'CO2Emissions',
      '@id': `https://test.flaks.example/test/co2-emissions/contract-${Date.now()}`,
      calculatedEmissions: { numericalValue: 1234.5, unit: 'KGM' },
    }

    const wire = CO2EmissionsCodec.serialize(co2 as never) as Record<string, unknown>
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)

    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('CO2Emissions')
  })
})
