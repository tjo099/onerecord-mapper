import { describe, expect, it } from 'vitest'
import { BookingRequestCodec, acceptBookingRequest } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: Booking flow via NE:ONE Server (T5.5)', () => {
  it.skipIf(!stackUp)('POSTs a BookingRequest with PENDING status', async () => {
    const req = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'BookingRequest',
      '@id': `https://test.flaks.example/test/bookingrequest/contract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      requestStatus: 'REQUEST_PENDING' as const,
      requestor: 'https://test.flaks.example/test/party/contract-requestor',
    }

    const wire = BookingRequestCodec.serialize(req as never) as Record<string, unknown>
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)

    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('BookingRequest')
    expect(got.requestStatus).toBe('REQUEST_PENDING')
    expect(got.requestor).toBe('https://test.flaks.example/test/party/contract-requestor')
  })

  it.skipIf(!stackUp)(
    'accepts the request via library transition + POSTs the resulting BookingOption',
    async () => {
      // First, create a BookingRequest server-side so we have a real IRI to link.
      const req = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'BookingRequest',
        '@id': `https://test.flaks.example/test/bookingrequest/contract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        requestStatus: 'REQUEST_PENDING' as const,
        requestor: 'https://test.flaks.example/test/party/contract-requestor-2',
      }
      const reqWire = BookingRequestCodec.serialize(req as never) as Record<string, unknown>
      const { iri: reqIri } = await postLogisticsObject(reqWire)

      // Use our library's transition to produce a BookingOption from the request.
      // Note: the client-minted @id on the input is irrelevant once we post via
      // the server (server assigns the resource IRI), but our transition fn
      // expects an @id on input — supply the server-assigned reqIri.
      const reqWithServerIri = { ...req, '@id': reqIri }
      const transition = acceptBookingRequest(reqWithServerIri as never)
      expect(transition.ok).toBe(true)
      if (!transition.ok) return

      // POST the produced BookingOption.
      const opt = transition.value
      const optWire = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'BookingOption',
        forBookingRequest: opt.forBookingRequest,
        optionStatus: opt.optionStatus,
      }
      const { iri: optIri } = await postLogisticsObject(optWire)
      const gotOpt = await getLogisticsObject(optIri)
      expect(gotOpt['@type']).toBe('BookingOption')
      expect(gotOpt.optionStatus).toBe('OPTION_PROPOSED')
      expect(gotOpt.forBookingRequest).toBe(reqIri)
    },
  )
})
