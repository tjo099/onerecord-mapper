import { envelope } from './common.js'

export interface BookingSegmentFactoryShape {
  '@context': string
  '@type': 'BookingSegment'
  '@id': string
  transportMovement: string
  sequenceNumber: number
}

export function createBookingSegment(
  overrides: Partial<BookingSegmentFactoryShape> = {},
): BookingSegmentFactoryShape {
  return {
    ...envelope('BookingSegment'),
    '@type': 'BookingSegment',
    transportMovement: 'https://example/transport-movement/1',
    sequenceNumber: 1,
    ...overrides,
  } as BookingSegmentFactoryShape
}
