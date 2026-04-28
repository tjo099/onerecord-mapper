import { describe, expect, it } from 'vitest'
import { FIELD_TYPES, expectedTypeFor } from '../../../src/dispatch/field-types.js'

describe('FIELD_TYPES — field-to-expected-class map', () => {
  it('Waybill.shipmentInformation expects Shipment', () => {
    expect(expectedTypeFor('Waybill', 'shipmentInformation')).toBe('Shipment')
  })

  it('Shipment.containedPieces expects Piece (array embedded)', () => {
    expect(expectedTypeFor('Shipment', 'containedPieces')).toBe('Piece')
  })

  it('Booking.forBookingOption expects BookingOption', () => {
    expect(expectedTypeFor('Booking', 'forBookingOption')).toBe('BookingOption')
  })

  it('Party.partyDetails is polymorphic (Person OR Organization)', () => {
    expect(expectedTypeFor('Party', 'partyDetails')).toBe('*')
  })

  it('Notification.relatedLogisticsObject is polymorphic', () => {
    expect(expectedTypeFor('Notification', 'relatedLogisticsObject')).toBe('*')
  })

  it('returns undefined for unknown class+field', () => {
    expect(expectedTypeFor('Waybill', 'nonExistent')).toBeUndefined()
  })

  it('omits external-endpoint URLs (Subscription.notificationEndpoint)', () => {
    // notificationEndpoint is an external URL, not a OneRecord type;
    // intentionally not in FIELD_TYPES so the graph-walker won't
    // try to type-check it as a logistics object.
    expect(expectedTypeFor('Subscription', 'notificationEndpoint')).toBeUndefined()
  })

  it('every key has the form ClassName.fieldName', () => {
    for (const key of Object.keys(FIELD_TYPES)) {
      expect(key).toMatch(/^[A-Z][A-Za-z]+\.[a-z][A-Za-z]+$/)
    }
  })

  it('every value is either a known class @type or "*"', () => {
    const knownTypes = new Set([
      'AccessDelegation',
      'AccountNumber',
      'Address',
      'Booking',
      'BookingOption',
      'BookingOptionRequest',
      'BookingPreferences',
      'BookingRequest',
      'Change',
      'Location',
      'MovementTime',
      'Operation',
      'Organization',
      'Party',
      'Person',
      'Piece',
      'Shipment',
      'Subscription',
      'TransportMovement',
      'Verification',
      '*',
    ])
    for (const value of Object.values(FIELD_TYPES)) {
      expect(knownTypes.has(value), `${value} is not a known type marker`).toBe(true)
    }
  })

  it('FIELD_TYPES is frozen', () => {
    expect(Object.isFrozen(FIELD_TYPES)).toBe(true)
  })
})
