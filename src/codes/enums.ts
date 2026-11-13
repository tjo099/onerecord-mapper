// src/codes/enums.ts
import { z } from 'zod'

export const RequestStatus = z.enum([
  'REQUEST_PENDING',
  'REQUEST_ACCEPTED',
  'REQUEST_REJECTED',
  'REQUEST_REVOKED',
])
export type RequestStatus = z.infer<typeof RequestStatus>

export const NotificationEventType = z.enum([
  'OBJECT_CREATED',
  'OBJECT_UPDATED',
  'LOGISTICS_EVENT_RECEIVED',
])
export type NotificationEventType = z.infer<typeof NotificationEventType>

export const SubscriptionEventType = z.enum([
  'OBJECT_CREATED',
  'OBJECT_UPDATED',
  'LOGISTICS_EVENT_RECEIVED',
])
export type SubscriptionEventType = z.infer<typeof SubscriptionEventType>

export const TopicType = z.enum([
  'LOGISTICS_OBJECT_TYPE',
  'LOGISTICS_OBJECT_INSTANCE',
  'LOGISTICS_EVENT_TYPE',
])
export type TopicType = z.infer<typeof TopicType>

export const Permission = z.enum(['READ', 'WRITE', 'AUDIT'])
export type Permission = z.infer<typeof Permission>

export const PatchOperation = z.enum(['ADD', 'DELETE'])
export type PatchOperation = z.infer<typeof PatchOperation>

export const BookingStatus = z.enum(['CONFIRMED', 'DELETED', 'QUEUED', 'REJECTED'])
export type BookingStatus = z.infer<typeof BookingStatus>

export const BookingOptionStatus = z.enum([
  'BOOKABLE',
  'BOOKED',
  'EXPIRED',
  'NONBOOKABLE',
  'NOT_BOOKABLE',
  'ON_REQUEST',
  'QUEUED',
])
export type BookingOptionStatus = z.infer<typeof BookingOptionStatus>

export const ChargeIdentifier = z.enum([
  'CN',
  'CO',
  'CT',
  'IN',
  'NI',
  'OA',
  'OC',
  'SI',
  'TX',
  'VC',
  'WT',
])
export type ChargeIdentifier = z.infer<typeof ChargeIdentifier>

export const PrepaidCollectIndicator = z.enum(['P', 'C'])
export type PrepaidCollectIndicator = z.infer<typeof PrepaidCollectIndicator>

export const EntitlementCode = z.enum(['C', 'A'])
export type EntitlementCode = z.infer<typeof EntitlementCode>

export const SpaceAllocationCode = z.enum([
  'CA',
  'CN',
  'HK',
  'HL',
  'HN',
  'KK',
  'LL',
  'NA',
  'NL',
  'NN',
  'SS',
  'UN',
  'UU',
  'XX',
])
export type SpaceAllocationCode = z.infer<typeof SpaceAllocationCode>

export const TransportMeansServiceType = z.enum([
  'FREIGHTER',
  'MIXED_CONFIGURATION_COMBI',
  'PASSENGER',
  'TRUCK',
])
export type TransportMeansServiceType = z.infer<typeof TransportMeansServiceType>

export const ScreeningMethod = z.enum(['AOM', 'CMD', 'EDD', 'EDS', 'ETD', 'PHS', 'VCK', 'XRY'])
export type ScreeningMethod = z.infer<typeof ScreeningMethod>

export const SecurityStatus = z.enum(['NSC', 'SCO', 'SHR', 'SPX'])
export type SecurityStatus = z.infer<typeof SecurityStatus>

export const ScreeningExemption = z.enum(['BIOM', 'DIPL', 'LFSM', 'MAIL', 'NUCL', 'SMUS', 'TRNS'])
export type ScreeningExemption = z.infer<typeof ScreeningExemption>

export const RegulatedEntityCategoryCode = z.enum(['AO', 'KC', 'RA', 'RC'])
export type RegulatedEntityCategoryCode = z.infer<typeof RegulatedEntityCategoryCode>

export const CompositionType = z.enum(['COMPOSITION', 'DECOMPOSITION'])
export type CompositionType = z.infer<typeof CompositionType>
