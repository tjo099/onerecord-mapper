// src/factory-classes.ts
//
// Single source of truth for the class registry. Used by:
//  - src/factory.ts (createMapper bindings synthesised from this map)
//  - src/facade.ts (facade const map entries enumerated from this map)
//  - src/codecs.ts (codec barrel re-exports enumerated from this map)
//  - test/unit/coverage/class-completeness.test.ts (EXPECTED_CLASS_COUNT)
//  - test/unit/api-surface/public-exports.test.ts (snapshot baseline)

import * as ADR from './classes/access-delegation-request/index.js'
import * as AD from './classes/access-delegation/index.js'
import * as An from './classes/account-number/index.js'
import * as Ad from './classes/address/index.js'
import * as BOR from './classes/booking-option-request/index.js'
import * as BO from './classes/booking-option/index.js'
import * as BP from './classes/booking-preferences/index.js'
import * as BR from './classes/booking-request/index.js'
import * as BS from './classes/booking-segment/index.js'
import * as BSh from './classes/booking-shipment/index.js'
import * as BT from './classes/booking-times/index.js'
import * as Bk from './classes/booking/index.js'
import * as CR from './classes/change-request/index.js'
import * as Ch from './classes/change/index.js'
import * as Co2 from './classes/co2-emissions/index.js'
import * as Co from './classes/company/index.js'
import * as CI from './classes/customs-information/index.js'
import * as HS from './classes/handling-service/index.js'
import * as In from './classes/insurance/index.js'
import * as LIP from './classes/line-item-package/index.js'
import * as Lc from './classes/location/index.js'
import * as Lm from './classes/loading-material/index.js'
import * as Le from './classes/logistics-event/index.js'
import * as Mt from './classes/movement-time/index.js'
import * as Nt from './classes/notification/index.js'
import * as Op from './classes/operation/index.js'
import * as OC from './classes/other-charge/index.js'
import * as Pa from './classes/party/index.js'
import * as Pe from './classes/person/index.js'
import * as Pc from './classes/piece/index.js'
import * as RE from './classes/regulated-entity/index.js'
import * as SD from './classes/security-declaration/index.js'
import * as SI from './classes/server-information/index.js'
import * as Sh from './classes/shipment/index.js'
import * as Sr from './classes/subscription-request/index.js'
import * as Su from './classes/subscription/index.js'
import * as Tm from './classes/transport-movement/index.js'
import * as UC from './classes/unit-composition/index.js'
import * as Ul from './classes/uld/index.js'
import * as VR from './classes/verification-request/index.js'
import * as Vf from './classes/verification/index.js'
import * as WLI from './classes/waybill-line-item/index.js'
import * as Wb from './classes/waybill/index.js'

/**
 * Every concrete class module. Originally ordered by Phase 5-11 implementation
 * rings (Ring 1 -> Ring 2 -> Ring 3 -> Ring 4 -> Ring 5 -> Booking); as of
 * v0.3.0 FWB-equivalence (Batch 1), six classes were added (Company,
 * WaybillLineItem, OtherCharge, CustomsInformation, Insurance, LineItemPackage)
 * and Organization was retired — map order is not semantically significant.
 *
 * `as const` preserves literal keys so mapped types over `keyof typeof CLASSES`
 * generate strongly-typed factory methods. `EXPECTED_CLASS_COUNT` derives from
 * `Object.keys(CLASSES).length` — no manual count is maintained.
 */
export const CLASSES = {
  Waybill: Wb,
  Shipment: Sh,
  Piece: Pc,
  CO2Emissions: Co2,
  Company: Co,
  CustomsInformation: CI,
  Insurance: In,
  LineItemPackage: LIP,
  OtherCharge: OC,
  Party: Pa,
  Person: Pe,
  WaybillLineItem: WLI,
  Address: Ad,
  AccountNumber: An,
  TransportMovement: Tm,
  LogisticsEvent: Le,
  MovementTime: Mt,
  Location: Lc,
  Subscription: Su,
  SubscriptionRequest: Sr,
  Notification: Nt,
  ChangeRequest: CR,
  Change: Ch,
  Operation: Op,
  AccessDelegation: AD,
  AccessDelegationRequest: ADR,
  Verification: Vf,
  VerificationRequest: VR,
  ServerInformation: SI,
  HandlingService: HS,
  Booking: Bk,
  BookingRequest: BR,
  BookingOption: BO,
  BookingOptionRequest: BOR,
  BookingPreferences: BP,
  BookingSegment: BS,
  BookingShipment: BSh,
  BookingTimes: BT,
  ULD: Ul,
  UnitComposition: UC,
  LoadingMaterial: Lm,
  RegulatedEntity: RE,
  SecurityDeclaration: SD,
} as const

export type ClassName = keyof typeof CLASSES

/** Used by class-completeness test (T76a) — count of concrete class directories. */
export const EXPECTED_CLASS_COUNT = Object.keys(CLASSES).length
