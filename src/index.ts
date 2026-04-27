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
export type { ServerCompatibility, ServerInformationLike } from './version.js'

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
