import { describe, expect, it } from 'vitest'
import { FIELD_TYPES, expectedTypeFor } from '../../../src/dispatch/field-types.js'

describe('FIELD_TYPES — field-to-expected-class map', () => {
  it('Waybill.shipment expects Shipment (Path-A corrected key)', () => {
    expect(expectedTypeFor('Waybill', 'shipment')).toBe('Shipment')
  })

  it('Shipment.pieces expects Piece (Path-A corrected key)', () => {
    expect(expectedTypeFor('Shipment', 'pieces')).toBe('Piece')
  })

  it('Waybill.shipmentInformation is no longer in FIELD_TYPES (stale v0.2 key removed)', () => {
    expect(expectedTypeFor('Waybill', 'shipmentInformation')).toBeUndefined()
  })

  it('Shipment.containedPieces is no longer in FIELD_TYPES (stale v0.2 key removed)', () => {
    expect(expectedTypeFor('Shipment', 'containedPieces')).toBeUndefined()
  })

  it('Booking.forBookingOption expects BookingOption', () => {
    expect(expectedTypeFor('Booking', 'forBookingOption')).toBe('BookingOption')
  })

  it('Party.partyDetails is polymorphic (Person OR Company)', () => {
    expect(expectedTypeFor('Party', 'partyDetails')).toBe('*')
  })

  it('Notification.relatedLogisticsObject is polymorphic', () => {
    expect(expectedTypeFor('Notification', 'relatedLogisticsObject')).toBe('*')
  })

  it('returns undefined for unknown class+field', () => {
    expect(expectedTypeFor('Waybill', 'nonExistent')).toBeUndefined()
  })

  it('omits external-endpoint URLs (Subscription.notificationEndpoint)', () => {
    expect(expectedTypeFor('Subscription', 'notificationEndpoint')).toBeUndefined()
  })

  it('every key has the form ClassName.fieldName', () => {
    for (const key of Object.keys(FIELD_TYPES)) {
      // Allow digits in class names (e.g. CO2Emissions) and field names
      expect(key).toMatch(/^[A-Z][A-Za-z0-9]+\.[a-z][A-Za-z0-9]+$/)
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
      'CO2Emissions',
      'Company',
      'CustomsInformation',
      'Insurance',
      'LineItemPackage',
      'Location',
      'MovementTime',
      'Operation',
      'Party',
      'Person',
      'Piece',
      'RegulatedEntity',
      'SecurityDeclaration',
      'Shipment',
      'Subscription',
      'TransportMovement',
      'ULD',
      'Verification',
      'Waybill',
      'WaybillLineItem',
      'OtherCharge',
      '*',
    ])
    for (const value of Object.values(FIELD_TYPES)) {
      expect(knownTypes.has(value), `${value} is not a known type marker`).toBe(true)
    }
  })

  it('Organization is no longer in FIELD_TYPES values (retired — Company is the concrete type)', () => {
    for (const value of Object.values(FIELD_TYPES)) {
      expect(value, `unexpected 'Organization' value found`).not.toBe('Organization')
    }
  })

  it('new v0.3.0 cross-refs are present', () => {
    expect(expectedTypeFor('Insurance', 'coveringOrganization')).toBe('Company')
    expect(expectedTypeFor('RegulatedEntity', 'owningOrganization')).toBe('Company')
    expect(expectedTypeFor('SecurityDeclaration', 'issuedForPiece')).toBe('Piece')
    expect(expectedTypeFor('SecurityDeclaration', 'issuedBy')).toBe('Person')
    expect(expectedTypeFor('TransportMovement', 'co2Emissions')).toBe('CO2Emissions')
    expect(expectedTypeFor('WaybillLineItem', 'lineItemPackages')).toBe('LineItemPackage')
    expect(expectedTypeFor('Waybill', 'waybillLineItems')).toBe('WaybillLineItem')
    expect(expectedTypeFor('Piece', 'securityDeclarations')).toBe('SecurityDeclaration')
    expect(expectedTypeFor('Shipment', 'securityDeclarations')).toBe('SecurityDeclaration')
    expect(expectedTypeFor('CO2Emissions', 'calculationFor')).toBe('*')
  })

  it('FIELD_TYPES is frozen', () => {
    expect(Object.isFrozen(FIELD_TYPES)).toBe(true)
  })
})
