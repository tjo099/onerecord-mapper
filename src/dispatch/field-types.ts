/**
 * Static map: '<Class>.<field>' -> expected `@type` of an embedded
 * object or IRI-referenced node. Used by `dispatchGraphWalk` to emit
 * `wrong_type_for_endpoint` when an embedded node's `@type` does not
 * match the field's contract.
 *
 * Coverage: every cross-referencing field across the registered class set.
 * Scalar fields and external-endpoint URLs
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
  // (AccountNumber.issuedBy removed — :issuedBy is range :Person / domain :SecurityDeclaration,
  //  not on :AccountNumber; do not repoint)

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

  // CO2Emissions
  'CO2Emissions.calculationFor': '*', // polymorphic — TransportMovement or Shipment etc.
  'TransportMovement.co2Emissions': 'CO2Emissions',

  // Company (concrete :Organization subtype — only concrete org type shipped)
  'Company.basedAtLocation': 'Location',
  // Organization-range properties pin to 'Company': :Company rdfs:subClassOf :Organization and
  // Company is the only concrete :Organization subtype this library ships post-Organization-
  // retirement, so 'Company' is the correct (not over-strict) wrong_type_for_endpoint contract.
  // Company.contactPersons → 'Person': ontology range is abstract :Actor, :Person rdfs:subClassOf
  // :Actor, no NonHumanActor shipped, so 'Person' is the correct concrete contract.
  'Company.contactPersons': 'Person',
  'Company.parentOrganization': 'Company',
  'Company.subOrganization': 'Company',

  // CustomsInformation
  'CustomsInformation.issuedForPiece': 'Piece',
  'CustomsInformation.issuedForShipment': 'Shipment',

  // Handling
  'HandlingService.provider': 'Party',
  'HandlingService.forShipment': 'Shipment',

  // Insurance
  'Insurance.coveringOrganization': 'Company',
  'Insurance.insuredShipments': 'Shipment',

  // LineItemPackage / ULD
  'LineItemPackage.pieceReferences': 'Piece',
  'WaybillLineItem.lineItemPackages': 'LineItemPackage',
  'WaybillLineItem.uldReferences': 'ULD',

  // Location ↔ Address
  'Location.address': 'Address',

  // Logistics event
  'LogisticsEvent.eventLocation': 'Location',
  'LogisticsEvent.relatedTransportMovement': 'TransportMovement',

  // Notification
  'Notification.relatedLogisticsObject': '*', // polymorphic

  // Party (Organization retired; partyDetails is Person or Company)
  'Party.partyDetails': '*', // polymorphic — Person or Company
  'Party.accountNumbers': 'AccountNumber',

  // Piece
  'Piece.ofShipment': 'Shipment',
  'Piece.containedPieces': 'Piece',
  'Piece.securityDeclarations': 'SecurityDeclaration',
  // Piece.packagingType omitted — :PackagingType is a codes class (enum), not a logistics object

  // RegulatedEntity
  'RegulatedEntity.owningOrganization': 'Company',

  // SecurityDeclaration
  'SecurityDeclaration.issuedForPiece': 'Piece',
  'SecurityDeclaration.issuedBy': 'Person',
  'SecurityDeclaration.regulatedEntityIssuer': 'RegulatedEntity',
  'SecurityDeclaration.regulatedEntityAcceptor': 'RegulatedEntity',
  'SecurityDeclaration.receivedFrom': 'RegulatedEntity',
  'SecurityDeclaration.otherRegulatedEntities': 'RegulatedEntity',

  // Shipment
  'Shipment.pieces': 'Piece',
  'Shipment.waybill': 'Waybill',
  'Shipment.involvedParties': 'Party',
  'Shipment.customsInformation': 'CustomsInformation',
  'Shipment.insurance': 'Insurance',
  'Shipment.securityDeclarations': 'SecurityDeclaration',

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
  'Waybill.shipment': 'Shipment',
  'Waybill.involvedParties': 'Party',
  'Waybill.waybillLineItems': 'WaybillLineItem',
  'Waybill.otherCharges': 'OtherCharge',
  'Waybill.carrierDeclarationPlace': 'Location',
  'Waybill.departureLocation': 'Location',
  'Waybill.arrivalLocation': 'Location',
  'Waybill.houseWaybills': 'Waybill',
  'Waybill.masterWaybill': 'Waybill',
  // Waybill.billingDetails omitted — :BillingDetails not modelled in v0.3.0 (deviation #16)
  'Waybill.referredBookingOption': 'BookingOption',
})

/**
 * Look up the expected `@type` for a given (className, fieldName).
 * Returns `undefined` for fields not in the map (= not validated by
 * the graph-walker — either scalar or out-of-scope external URL).
 * Returns `'*'` for polymorphic fields where any logistics-object
 * `@type` is valid.
 */
export function expectedTypeFor(className: string, fieldName: string): string | undefined {
  return FIELD_TYPES[`${className}.${fieldName}`]
}
