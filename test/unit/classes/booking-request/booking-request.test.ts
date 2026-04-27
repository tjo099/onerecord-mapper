import { describe, expect, it } from 'vitest'
import {
  BookingRequestCodec,
  BookingRequestSchema,
  deserializeBookingRequest,
  serializeBookingRequest,
} from '../../../../src/classes/booking-request/index.js'
import { createBookingRequest } from '../../../factories/booking-request.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingRequest', () => {
  it('round-trips field-equivalent', () => {
    const req = BookingRequestSchema.parse(createBookingRequest())
    const r = deserializeBookingRequest(serializeBookingRequest(req))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, req)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingRequest({
      ...createBookingRequest(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in requestor with invalid_iri', () => {
    const r = deserializeBookingRequest({ ...createBookingRequest(), requestor: 'not-a-valid-iri' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const req = BookingRequestSchema.parse(createBookingRequest())
    const r = BookingRequestCodec.serializeStrict(req)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingRequest"', () => {
    expect(BookingRequestCodec.type).toBe('BookingRequest')
  })
})
