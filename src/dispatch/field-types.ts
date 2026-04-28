/**
 * Static map: '<Class>.<field>' -> expected `@type` of an embedded
 * object or IRI-referenced node. Used by `dispatchGraphWalk` to emit
 * `wrong_type_for_endpoint` when an embedded node's `@type` does not
 * match the field's contract.
 *
 * Coverage: every field in the 32-class data model that points at
 * another logistics-object node (via `safeIri()` reference or
 * embedded array). Scalar fields and external-endpoint URLs
 * (`Subscription.notificationEndpoint`, `ServerInformation.serverEndpoint`)
 * are intentionally omitted — those don't resolve to a OneRecord type.
 *
 * Polymorphic fields are marked with `'*'`. The graph-walker treats
 * `'*'` as "any logistics-object type accepted".
 *
 * Maintenance: when adding a new class or field that holds a
 * cross-reference, also add the expected-type mapping here. The
 * graph-walker only checks mapped fields, so omission is silent —
 * a missing entry means "not validated".
 */
export const FIELD_TYPES: Readonly<Record<string, string>> = Object.freeze({
  // Access-delegation
  'AccessDelegationRequest.accessDelegation': 'AccessDelegation',
  'AccessDelegation.delegatedTo': 'Party',
  'AccessDelegation.delegatedFrom': 'Party',

  // Account number
  'AccountNumber.issuedBy': 'Organization',

  // Booking ecosystem
  'Booking.forBookingRequest': 'BookingRequest',
  'Booking.forBookingOption': 'BookingOption',
  'BookingOption.forBookingRequest': 'BookingRequest',
  'BookingOption.preferences': 'BookingPreferences',
  'BookingOptionRequest.forBookingOption': 'BookingOption',
  'BookingRequest.requestor': 'Party',
  'BookingRequest.preferences': 'BookingPreferences',
  'BookingSegment.transportMovement': 'TransportMovement',
  'BookingSegment.loadingLocation': 'Location',
  'BookingSegment.unloadingLocation': 'Location',
  'BookingShipment.forShipment': 'Shipment',

  // Change ecosystem
  'Change.hasOperation': 'Operation', // embedded array, not IRI ref
  'ChangeRequest.forLogisticsObject': '*', // polymorphic
  'ChangeRequest.hasChange': 'Change',

  // Handling
  'HandlingService.provider': 'Party',
  'HandlingService.forShipment': 'Shipment',

  // Location ↔ Address
  'Location.address': 'Address',

  // Logistics event
  'LogisticsEvent.eventLocation': 'Location',
  'LogisticsEvent.relatedTransportMovement': 'TransportMovement',

  // Notification
  'Notification.relatedLogisticsObject': '*', // polymorphic

  // Organization / Party
  'Organization.address': 'Address',
  'Organization.contactPersons': 'Person',
  'Party.partyDetails': '*', // polymorphic — Person or Organization
  'Party.accountNumbers': 'AccountNumber',

  // Shipment / Piece
  'Shipment.containedPieces': 'Piece',
  'Shipment.consignee': 'Party',
  'Shipment.shipper': 'Party',

  // Subscription
  'SubscriptionRequest.subscription': 'Subscription',
  'Subscription.topic': '*', // polymorphic — any logistics object class IRI
  'Subscription.subscriber': 'Party',

  // Transport movement
  'TransportMovement.departureLocation': 'Location',
  'TransportMovement.arrivalLocation': 'Location',
  'TransportMovement.movementTimes': 'MovementTime',

  // Verification
  'VerificationRequest.verification': 'Verification',
  'Verification.verifiedObject': '*', // polymorphic

  // Waybill
  'Waybill.shipmentInformation': 'Shipment',
  'Waybill.referredBookingOption': 'BookingOption',
})

/**
 * Look up the expected `@type` for a given (className, fieldName).
 * Returns `undefined` for fields not in the map (= not validated by
 * the graph-walker — either scalar or out-of-scope external URL).
 * Returns `'*'` for polymorphic fields where any logistics-object
 * `@type` is valid.
 */
export function expectedTypeFor(
  className: string,
  fieldName: string,
): string | undefined {
  return FIELD_TYPES[`${className}.${fieldName}`]
}
