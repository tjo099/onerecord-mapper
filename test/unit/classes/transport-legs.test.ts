import { describe, expect, it } from 'vitest'
import {
  TransportLegsCodec,
  TransportLegsSchema,
  deserializeTransportLegs,
  serializeTransportLegs,
  serializeTransportLegsStrict,
} from '../../../src/classes/transport-legs/index.js'
import type { ParseResult } from '../../../src/result.js'
import { envelope, testIri } from '../../factories/common.js'
import { createTransportLegs } from '../../factories/transport-legs.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'TransportLegs',
  schema: TransportLegsSchema,
  serialize: serializeTransportLegs,
  serializeStrict: serializeTransportLegsStrict,
  deserialize: deserializeTransportLegs,
  codec: TransportLegsCodec,
  factory: createTransportLegs,
  invalidIriField: 'arrivalLocation',
})

function expectKind(r: ParseResult<unknown>, kind: string, path?: string): void {
  expect(r.ok).toBe(false)
  if (r.ok) return
  expect(r.error.kind).toBe(kind)
  if (path !== undefined && r.error.kind === 'zod_validation') {
    expect(r.error.issues[0]?.path).toBe(path)
  }
}

describe('TransportLegs explicit cases', () => {
  it('envelope-only parses', () => {
    expect(deserializeTransportLegs(envelope('TransportLegs')).ok).toBe(true)
  })
  it('fully populated object parses', () => {
    const r = deserializeTransportLegs({
      ...createTransportLegs(),
      arrivalDate: '2026-11-20T12:00:00Z',
      transportMeansServiceType: 'FREIGHTER',
      transportMeansType: 'B777F',
      co2Emissions: testIri('CO2Emissions', '00000000-0000-0000-0000-000000000022'),
      operatingTransportMeans: testIri('TransportMeans', '00000000-0000-0000-0000-000000000023'),
    })
    expect(r.ok).toBe(true)
  })
  it('legNumber: 1.5 -> zod_validation at legNumber', () => {
    expectKind(
      deserializeTransportLegs({ ...createTransportLegs(), legNumber: 1.5 }),
      'zod_validation',
      'legNumber',
    )
  })
  it("transportMeansServiceType: 'SHIP' -> zod_validation at that path", () => {
    expectKind(
      deserializeTransportLegs({ ...createTransportLegs(), transportMeansServiceType: 'SHIP' }),
      'zod_validation',
      'transportMeansServiceType',
    )
  })
  it('transportIdentifier of 18 chars -> zod_validation at that path', () => {
    expectKind(
      deserializeTransportLegs({ ...createTransportLegs(), transportIdentifier: 'X'.repeat(18) }),
      'zod_validation',
      'transportIdentifier',
    )
  })
  it('transportIdentifier of 17 chars is ok', () => {
    expect(
      deserializeTransportLegs({ ...createTransportLegs(), transportIdentifier: 'X'.repeat(17) })
        .ok,
    ).toBe(true)
  })
  it('departureDate with +02:00 offset is ok', () => {
    expect(
      deserializeTransportLegs({
        ...createTransportLegs(),
        departureDate: '2026-11-20T10:00:00+02:00',
      }).ok,
    ).toBe(true)
  })
  it('departureDate without timezone -> zod_validation at departureDate', () => {
    expectKind(
      deserializeTransportLegs({ ...createTransportLegs(), departureDate: '2026-11-20T10:00:00' }),
      'zod_validation',
      'departureDate',
    )
  })
  it('arrivalDate without timezone -> zod_validation at arrivalDate', () => {
    expectKind(
      deserializeTransportLegs({ ...createTransportLegs(), arrivalDate: '2026-11-20T12:00:00' }),
      'zod_validation',
      'arrivalDate',
    )
  })
})
