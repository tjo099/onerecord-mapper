// Public API for @flaks/onerecord — Ring 1 (Waybill, Shipment, Piece) wired in
// at Phase 5 Task 28. Subsequent rings land in Phases 6-11.

// Result + error types
export {
  PARSE_ERROR_KIND_TO_FILE,
  PARSE_ERROR_KINDS,
  SerializationError,
  err,
  ok,
} from './result.js'
export type { ParseError, ParseResult, PublicParseError } from './result.js'

// Version + ontology pin
export {
  API_CONTEXT_IRI,
  API_SPEC_VERSION,
  ALLOWED_CONTEXTS,
  CARGO_CONTEXT_IRI,
  CARGO_ONTOLOGY_VERSION,
  __VERSION__,
  assertContextAllowed,
  assertOntologyVersion,
  checkServerInformation,
} from './version.js'
export type { ServerCompatibility } from './version.js'

// IRI primitives
export { defaultIriStrategy } from './iri/default-strategy.js'
export type { ClassName, IriParts, IriStrategy, SafeIri } from './iri/strategy.js'
export { validateIri } from './iri/validate.js'
export type { ValidateIriOpts } from './iri/validate.js'
export { extractInvalidIriIssue, findInvalidIriInIssues, safeIri } from './iri/zod-safe-iri.js'

// Safety limits
export { DEFAULT_SAFETY_LIMITS, mergeLimits } from './safety/limits.js'
export type { DeserializeOpts, SafetyLimits, SerializeOpts } from './safety/limits.js'

// Codes / enums (Zod enum objects — each name serves as both value and type;
// a single export {} covers the runtime value; consumers do typeof X to get the
// inferred Zod schema or import the type alias separately via the enums module)
export {
  BookingOptionStatus,
  BookingStatus,
  NotificationEventType,
  PatchOperation,
  Permission,
  RequestStatus,
  SubscriptionEventType,
  TopicType,
} from './codes/index.js'

// FSU event codes (Phase 7 / Task 38)
export {
  FSU_EVENT_CODES,
  fsuCodeToEventTypeCode,
} from './codes/fsu-event-codes.js'
export type { FsuCode, FsuEventMapping } from './codes/fsu-event-codes.js'

// Shared base
export type { JsonLd } from './classes/shared/jsonld-brand.js'
export { LogisticsObjectSchema } from './classes/shared/logistics-object.js'
export type { LogisticsObject } from './classes/shared/logistics-object.js'
export type { Codec } from './classes/shared/codec.js'

// Ring 1 — Waybill
export {
  WaybillCodec,
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
  serializeWaybillStrict,
} from './classes/waybill/index.js'
export type { JsonLdWaybill, Waybill } from './classes/waybill/index.js'

// Ring 1 — Shipment
export {
  ShipmentCodec,
  ShipmentSchema,
  deserializeShipment,
  serializeShipment,
  serializeShipmentStrict,
} from './classes/shipment/index.js'
export type { JsonLdShipment, Shipment } from './classes/shipment/index.js'

// Ring 1 — Piece
export {
  PieceCodec,
  PieceSchema,
  deserializePiece,
  serializePiece,
  serializePieceStrict,
} from './classes/piece/index.js'
export type { JsonLdPiece, Piece } from './classes/piece/index.js'

// Ring 2 — Address
export {
  AddressCodec,
  AddressSchema,
  deserializeAddress,
  serializeAddress,
  serializeAddressStrict,
} from './classes/address/index.js'
export type { Address, JsonLdAddress } from './classes/address/index.js'

// Ring 2 — Person
export {
  PersonCodec,
  PersonSchema,
  deserializePerson,
  serializePerson,
  serializePersonStrict,
} from './classes/person/index.js'
export type { JsonLdPerson, Person } from './classes/person/index.js'

// Ring 2 — Organization
export {
  OrganizationCodec,
  OrganizationSchema,
  deserializeOrganization,
  serializeOrganization,
  serializeOrganizationStrict,
} from './classes/organization/index.js'
export type { JsonLdOrganization, Organization } from './classes/organization/index.js'

// Ring 2 — Party
export {
  PartyCodec,
  PartySchema,
  deserializeParty,
  serializeParty,
  serializePartyStrict,
} from './classes/party/index.js'
export type { JsonLdParty, Party } from './classes/party/index.js'

// Ring 5 — AccountNumber (referenced by Party.accountNumbers, wired alongside Ring 2)
export {
  AccountNumberCodec,
  AccountNumberSchema,
  deserializeAccountNumber,
  serializeAccountNumber,
  serializeAccountNumberStrict,
} from './classes/account-number/index.js'
export type {
  AccountNumber,
  JsonLdAccountNumber,
} from './classes/account-number/index.js'

// Ring 4 — Subscription
export {
  SubscriptionCodec,
  SubscriptionSchema,
  deserializeSubscription,
  serializeSubscription,
  serializeSubscriptionStrict,
} from './classes/subscription/index.js'
export type { JsonLdSubscription, Subscription } from './classes/subscription/index.js'

// Ring 4 — SubscriptionRequest
export {
  SubscriptionRequestCodec,
  SubscriptionRequestSchema,
  deserializeSubscriptionRequest,
  serializeSubscriptionRequest,
  serializeSubscriptionRequestStrict,
} from './classes/subscription-request/index.js'
export type {
  JsonLdSubscriptionRequest,
  SubscriptionRequest,
} from './classes/subscription-request/index.js'

// Ring 4 — Notification
export {
  NotificationCodec,
  NotificationSchema,
  deserializeNotification,
  serializeNotification,
  serializeNotificationStrict,
} from './classes/notification/index.js'
export type { JsonLdNotification, Notification } from './classes/notification/index.js'

// Ring 4 — ChangeRequest
export {
  ChangeRequestCodec,
  ChangeRequestSchema,
  deserializeChangeRequest,
  serializeChangeRequest,
  serializeChangeRequestStrict,
} from './classes/change-request/index.js'
export type { ChangeRequest, JsonLdChangeRequest } from './classes/change-request/index.js'

// Ring 4 — Change
export {
  ChangeCodec,
  ChangeSchema,
  deserializeChange,
  serializeChange,
  serializeChangeStrict,
} from './classes/change/index.js'
export type { Change, JsonLdChange } from './classes/change/index.js'

// Ring 4 — Operation
export {
  OperationCodec,
  OperationSchema,
  deserializeOperation,
  serializeOperation,
  serializeOperationStrict,
} from './classes/operation/index.js'
export type { JsonLdOperation, Operation } from './classes/operation/index.js'

// Ring 4 — AccessDelegation
export {
  AccessDelegationCodec,
  AccessDelegationSchema,
  deserializeAccessDelegation,
  serializeAccessDelegation,
  serializeAccessDelegationStrict,
} from './classes/access-delegation/index.js'
export type {
  AccessDelegation,
  JsonLdAccessDelegation,
} from './classes/access-delegation/index.js'

// Ring 4 — AccessDelegationRequest
export {
  AccessDelegationRequestCodec,
  AccessDelegationRequestSchema,
  deserializeAccessDelegationRequest,
  serializeAccessDelegationRequest,
  serializeAccessDelegationRequestStrict,
} from './classes/access-delegation-request/index.js'
export type {
  AccessDelegationRequest,
  JsonLdAccessDelegationRequest,
} from './classes/access-delegation-request/index.js'

// Ring 4 — Verification (branded UnverifiedVerification)
export {
  VerificationCodec,
  VerificationSchema,
  deserializeVerification,
  serializeVerification,
  serializeVerificationStrict,
} from './classes/verification/index.js'
export type {
  JsonLdVerification,
  UnverifiedVerification,
  Verification,
} from './classes/verification/index.js'

// Ring 4 — VerificationRequest
export {
  VerificationRequestCodec,
  VerificationRequestSchema,
  deserializeVerificationRequest,
  serializeVerificationRequest,
  serializeVerificationRequestStrict,
} from './classes/verification-request/index.js'
export type {
  JsonLdVerificationRequest,
  VerificationRequest,
} from './classes/verification-request/index.js'

// Ring 4 — ServerInformation
export {
  ServerInformationCodec,
  ServerInformationSchema,
  deserializeServerInformation,
  serializeServerInformation,
  serializeServerInformationStrict,
} from './classes/server-information/index.js'
export type {
  JsonLdServerInformation,
  ServerInformation,
} from './classes/server-information/index.js'

// Phase 9 — Operations (applyChange + JSON-pointer + validateOperation)
export {
  applyChange,
  asJsonPointer,
  splitPointer,
  validateOperation,
} from './operations/index.js'
export type {
  ApplyChangeOpts,
  ChangeLike,
  JsonPointer,
  OperationLike,
} from './operations/index.js'

// Phase 10 — Booking ecosystem (STATE_DIAGRAM + transitions)
export {
  STATE_DIAGRAM,
  acceptBookingOption,
  acceptBookingRequest,
  canTransition,
  rejectBookingOption,
  revokeBookingOption,
} from './booking-flow/index.js'
export type {
  BookingAction,
  BookingType,
  StateDiagram,
  Transition,
} from './booking-flow/index.js'

// Phase 10 — Booking
export {
  BookingCodec,
  BookingSchema,
  deserializeBooking,
  serializeBooking,
  serializeBookingStrict,
} from './classes/booking/index.js'
export type { Booking, JsonLdBooking } from './classes/booking/index.js'

// Phase 10 — BookingOption
export {
  BookingOptionCodec,
  BookingOptionSchema,
  deserializeBookingOption,
  serializeBookingOption,
  serializeBookingOptionStrict,
} from './classes/booking-option/index.js'
export type {
  BookingOption,
  JsonLdBookingOption,
} from './classes/booking-option/index.js'

// Phase 10 — BookingOptionRequest
export {
  BookingOptionRequestCodec,
  BookingOptionRequestSchema,
  deserializeBookingOptionRequest,
  serializeBookingOptionRequest,
  serializeBookingOptionRequestStrict,
} from './classes/booking-option-request/index.js'
export type {
  BookingOptionRequest,
  JsonLdBookingOptionRequest,
} from './classes/booking-option-request/index.js'

// Phase 10 — BookingRequest
export {
  BookingRequestCodec,
  BookingRequestSchema,
  deserializeBookingRequest,
  serializeBookingRequest,
  serializeBookingRequestStrict,
} from './classes/booking-request/index.js'
export type {
  BookingRequest,
  JsonLdBookingRequest,
} from './classes/booking-request/index.js'

// Phase 10 — BookingPreferences
export {
  BookingPreferencesCodec,
  BookingPreferencesSchema,
  deserializeBookingPreferences,
  serializeBookingPreferences,
  serializeBookingPreferencesStrict,
} from './classes/booking-preferences/index.js'
export type {
  BookingPreferences,
  JsonLdBookingPreferences,
} from './classes/booking-preferences/index.js'

// Phase 10 — BookingShipment
export {
  BookingShipmentCodec,
  BookingShipmentSchema,
  deserializeBookingShipment,
  serializeBookingShipment,
  serializeBookingShipmentStrict,
} from './classes/booking-shipment/index.js'
export type {
  BookingShipment,
  JsonLdBookingShipment,
} from './classes/booking-shipment/index.js'

// Phase 10 — BookingTimes
export {
  BookingTimesCodec,
  BookingTimesSchema,
  deserializeBookingTimes,
  serializeBookingTimes,
  serializeBookingTimesStrict,
} from './classes/booking-times/index.js'
export type {
  BookingTimes,
  JsonLdBookingTimes,
} from './classes/booking-times/index.js'

// Phase 10 — BookingSegment
export {
  BookingSegmentCodec,
  BookingSegmentSchema,
  deserializeBookingSegment,
  serializeBookingSegment,
  serializeBookingSegmentStrict,
} from './classes/booking-segment/index.js'
export type {
  BookingSegment,
  JsonLdBookingSegment,
} from './classes/booking-segment/index.js'

// Phase 11 — HandlingService
export {
  HandlingServiceCodec,
  HandlingServiceSchema,
  deserializeHandlingService,
  serializeHandlingService,
  serializeHandlingServiceStrict,
} from './classes/handling-service/index.js'
export type {
  HandlingService,
  JsonLdHandlingService,
} from './classes/handling-service/index.js'
