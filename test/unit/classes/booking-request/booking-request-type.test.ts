import { describe, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import type {
  BookingRequest,
  BookingRequestSchema,
} from '../../../../src/classes/booking-request/index.js'

type Simplify<T> = { [K in keyof T]: T[K] }

describe('BookingRequest type', () => {
  it('Simplify<BookingRequest> equals z.infer<typeof BookingRequestSchema>', () => {
    expectTypeOf<Simplify<BookingRequest>>().toEqualTypeOf<z.infer<typeof BookingRequestSchema>>()
  })
})
