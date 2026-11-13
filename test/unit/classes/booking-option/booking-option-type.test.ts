import { describe, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import type {
  BookingOption,
  BookingOptionSchema,
} from '../../../../src/classes/booking-option/index.js'

type Simplify<T> = { [K in keyof T]: T[K] }

describe('BookingOption type', () => {
  it('Simplify<BookingOption> equals z.infer<typeof BookingOptionSchema>', () => {
    expectTypeOf<Simplify<BookingOption>>().toEqualTypeOf<z.infer<typeof BookingOptionSchema>>()
  })
})
