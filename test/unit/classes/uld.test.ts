import { describe, expect, it } from 'vitest'
import {
  ULDCodec,
  ULDSchema,
  deserializeULD,
  serializeULD,
  serializeULDStrict,
} from '../../../src/classes/uld/index.js'
import type { SafeIri } from '../../../src/iri/strategy.js'
import { testIri } from '../../factories/common.js'
import { createULD } from '../../factories/uld.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'ULD',
  schema: ULDSchema,
  serialize: serializeULD,
  serializeStrict: serializeULDStrict,
  deserialize: deserializeULD,
  codec: ULDCodec,
  factory: createULD,
})

describe('ULD.inUnitComposition', () => {
  it('round-trips a valid IRI and rejects an invalid IRI with invalid_iri', () => {
    const validIri = testIri('UnitComposition') as SafeIri
    const withValid = createULD({ inUnitComposition: validIri })
    const rValid = deserializeULD(serializeULD(withValid))
    expect(rValid.ok).toBe(true)
    if (rValid.ok) expect(rValid.value.inUnitComposition).toBe(validIri)

    const withInvalid = { ...createULD(), inUnitComposition: 'not-a-valid-iri' }
    const rInvalid = deserializeULD(withInvalid)
    expect(rInvalid.ok).toBe(false)
    if (!rInvalid.ok) expect(rInvalid.error.kind).toBe('invalid_iri')
  })
})
