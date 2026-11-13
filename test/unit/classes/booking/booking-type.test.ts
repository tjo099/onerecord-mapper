import { describe, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import type { Booking, BookingSchema } from '../../../../src/classes/booking/index.js'

type Simplify<T> = { [K in keyof T]: T[K] }

describe('Booking type', () => {
  it('Simplify<Booking> equals z.infer<typeof BookingSchema>', () => {
    expectTypeOf<Simplify<Booking>>().toEqualTypeOf<z.infer<typeof BookingSchema>>()
  })
})
