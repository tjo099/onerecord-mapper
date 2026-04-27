// src/types/index.ts
//
// Type-only barrel for consumers who want zero runtime cost — useful for
// purely typing OneRecord payloads in API gateways or message queues.
export type { ParseError, ParseResult, PublicParseError } from '../result.js'
export type { Codec } from '../classes/shared/codec.js'
export type { JsonLd } from '../classes/shared/jsonld-brand.js'
export type { LogisticsObject } from '../classes/shared/logistics-object.js'
export type { SafeIri, IriStrategy, IriParts, ClassName } from '../iri/strategy.js'
export type { SafetyLimits, DeserializeOpts, SerializeOpts } from '../safety/limits.js'

// Per-class App + Wire types (32 each)
export type {
  AccessDelegation,
  JsonLdAccessDelegation,
} from '../classes/access-delegation/index.js'
export type {
  AccessDelegationRequest,
  JsonLdAccessDelegationRequest,
} from '../classes/access-delegation-request/index.js'
export type { AccountNumber, JsonLdAccountNumber } from '../classes/account-number/index.js'
export type { Address, JsonLdAddress } from '../classes/address/index.js'
export type { Booking, JsonLdBooking } from '../classes/booking/index.js'
export type { BookingOption, JsonLdBookingOption } from '../classes/booking-option/index.js'
export type {
  BookingOptionRequest,
  JsonLdBookingOptionRequest,
} from '../classes/booking-option-request/index.js'
export type {
  BookingPreferences,
  JsonLdBookingPreferences,
} from '../classes/booking-preferences/index.js'
export type { BookingRequest, JsonLdBookingRequest } from '../classes/booking-request/index.js'
export type { BookingSegment, JsonLdBookingSegment } from '../classes/booking-segment/index.js'
export type { BookingShipment, JsonLdBookingShipment } from '../classes/booking-shipment/index.js'
export type { BookingTimes, JsonLdBookingTimes } from '../classes/booking-times/index.js'
export type { Change, JsonLdChange } from '../classes/change/index.js'
export type { ChangeRequest, JsonLdChangeRequest } from '../classes/change-request/index.js'
export type { HandlingService, JsonLdHandlingService } from '../classes/handling-service/index.js'
export type { JsonLdLocation, Location } from '../classes/location/index.js'
export type { JsonLdLogisticsEvent, LogisticsEvent } from '../classes/logistics-event/index.js'
export type { JsonLdMovementTime, MovementTime } from '../classes/movement-time/index.js'
export type { JsonLdNotification, Notification } from '../classes/notification/index.js'
export type { JsonLdOperation, Operation } from '../classes/operation/index.js'
export type { JsonLdOrganization, Organization } from '../classes/organization/index.js'
export type { JsonLdParty, Party } from '../classes/party/index.js'
export type { JsonLdPerson, Person } from '../classes/person/index.js'
export type { JsonLdPiece, Piece } from '../classes/piece/index.js'
export type {
  JsonLdServerInformation,
  ServerInformation,
} from '../classes/server-information/index.js'
export type { JsonLdShipment, Shipment } from '../classes/shipment/index.js'
export type { JsonLdSubscription, Subscription } from '../classes/subscription/index.js'
export type {
  JsonLdSubscriptionRequest,
  SubscriptionRequest,
} from '../classes/subscription-request/index.js'
export type {
  JsonLdTransportMovement,
  TransportMovement,
} from '../classes/transport-movement/index.js'
export type {
  JsonLdVerification,
  UnverifiedVerification,
  Verification,
} from '../classes/verification/index.js'
export type {
  JsonLdVerificationRequest,
  VerificationRequest,
} from '../classes/verification-request/index.js'
export type { JsonLdWaybill, Waybill } from '../classes/waybill/index.js'
