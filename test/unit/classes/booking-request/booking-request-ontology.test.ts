import { describe, expect, it } from 'vitest'
import {
  BookingRequestSchema,
  deserializeBookingRequest,
} from '../../../../src/classes/booking-request/index.js'
import { createBookingRequest } from '../../../factories/booking-request.js'
import { envelope, testIri } from '../../../factories/common.js'
import { BookingRequestSchema as S05 } from '../../../oracle/v0.5.0/index.js'

const IRI = (s: string) => `https://1r.example.com/logistics-objects/${s}`

describe('BookingRequest ontology realignment', () => {
  it('G4a: 0.5.0 values parse identically', () => {
    for (const x of [
      createBookingRequest(),
      {
        ...createBookingRequest({ requestStatus: 'REQUEST_REVOKED' }),
        preferences: testIri('BookingPreferences', '00000000-0000-0000-0000-0000000000a1'),
      },
    ]) {
      expect(BookingRequestSchema.parse(x)).toEqual(S05.parse(x))
      expect(Object.keys(BookingRequestSchema.parse(x))).toEqual(Object.keys(S05.parse(x)))
    }
  })

  it('G4b: ontology-only shape parses', () => {
    const r = deserializeBookingRequest({
      ...envelope('BookingRequest'),
      booking: IRI('bk'),
      forBookingOption: IRI('bo'),
      waybillPrefix: '020',
      waybillNumber: '12345675',
    })
    expect(r.ok).toBe(true)
  })

  it('G4b: envelope-only BookingRequest parses', () => {
    expect(deserializeBookingRequest({ ...envelope('BookingRequest') }).ok).toBe(true)
  })

  it('G4c: legacy and ontology keys parse together', () => {
    const r = deserializeBookingRequest({
      ...envelope('BookingRequest'),
      requestStatus: 'REQUEST_PENDING',
      requestor: IRI('org'),
      booking: IRI('bk'),
    })
    expect(r.ok).toBe(true)
  })

  it('G4d: skeletonIndicator → zod_validation, code unrecognized_keys', () => {
    const r = deserializeBookingRequest({ ...envelope('BookingRequest'), skeletonIndicator: true })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'zod_validation') {
      expect(r.error.issues[0]?.code).toBe('unrecognized_keys')
    } else {
      expect.unreachable('expected zod_validation')
    }
  })

  it("waybillPrefix 'ABCD' → zod_validation at path waybillPrefix", () => {
    const r = deserializeBookingRequest({ ...envelope('BookingRequest'), waybillPrefix: 'ABCD' })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'zod_validation') {
      expect(r.error.issues[0]?.path).toBe('waybillPrefix')
    } else {
      expect.unreachable('expected zod_validation')
    }
  })
})
