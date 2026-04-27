// src/codecs.ts
// Subpath barrel: @flaks/onerecord/codecs
// Re-exports every codec individually (tree-shakeable) + a frozen CODECS map for iteration.

import { CLASSES } from './factory-classes.js'

// Individual codec re-exports — one per class, tree-shakeable.
export { AccessDelegationCodec } from './classes/access-delegation/index.js'
export { AccessDelegationRequestCodec } from './classes/access-delegation-request/index.js'
export { AccountNumberCodec } from './classes/account-number/index.js'
export { AddressCodec } from './classes/address/index.js'
export { BookingCodec } from './classes/booking/index.js'
export { BookingOptionCodec } from './classes/booking-option/index.js'
export { BookingOptionRequestCodec } from './classes/booking-option-request/index.js'
export { BookingPreferencesCodec } from './classes/booking-preferences/index.js'
export { BookingRequestCodec } from './classes/booking-request/index.js'
export { BookingSegmentCodec } from './classes/booking-segment/index.js'
export { BookingShipmentCodec } from './classes/booking-shipment/index.js'
export { BookingTimesCodec } from './classes/booking-times/index.js'
export { ChangeCodec } from './classes/change/index.js'
export { ChangeRequestCodec } from './classes/change-request/index.js'
export { HandlingServiceCodec } from './classes/handling-service/index.js'
export { LocationCodec } from './classes/location/index.js'
export { LogisticsEventCodec } from './classes/logistics-event/index.js'
export { MovementTimeCodec } from './classes/movement-time/index.js'
export { NotificationCodec } from './classes/notification/index.js'
export { OperationCodec } from './classes/operation/index.js'
export { OrganizationCodec } from './classes/organization/index.js'
export { PartyCodec } from './classes/party/index.js'
export { PersonCodec } from './classes/person/index.js'
export { PieceCodec } from './classes/piece/index.js'
export { ServerInformationCodec } from './classes/server-information/index.js'
export { ShipmentCodec } from './classes/shipment/index.js'
export { SubscriptionCodec } from './classes/subscription/index.js'
export { SubscriptionRequestCodec } from './classes/subscription-request/index.js'
export { TransportMovementCodec } from './classes/transport-movement/index.js'
export { VerificationCodec } from './classes/verification/index.js'
export { VerificationRequestCodec } from './classes/verification-request/index.js'
export { WaybillCodec } from './classes/waybill/index.js'

/**
 * Frozen map of all codecs keyed by class name — useful for consumers
 * who need to iterate over all 32 codecs programmatically.
 */
export const CODECS = Object.freeze(
  Object.fromEntries(
    (Object.keys(CLASSES) as Array<keyof typeof CLASSES>).map((c) => [
      c,
      (CLASSES[c] as Record<string, unknown>)[`${c}Codec`],
    ]),
  ),
) as Record<keyof typeof CLASSES, unknown>
