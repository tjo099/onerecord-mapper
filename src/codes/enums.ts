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

export const BookingStatus = z.enum([
  'REQUEST_PENDING',
  'REQUEST_ACCEPTED',
  'REQUEST_REJECTED',
  'REQUEST_REVOKED',
])
export type BookingStatus = z.infer<typeof BookingStatus>

export const BookingOptionStatus = z.enum([
  'REQUEST_PENDING',
  'REQUEST_ACCEPTED',
  'REQUEST_REJECTED',
  'REQUEST_REVOKED',
])
export type BookingOptionStatus = z.infer<typeof BookingOptionStatus>

export const ScreeningMethod = z.enum(['AOM', 'CMD', 'EDD', 'EDS', 'ETD', 'PHS', 'VCK', 'XRY'])
export type ScreeningMethod = z.infer<typeof ScreeningMethod>

export const SecurityStatus = z.enum(['NSC', 'SCO', 'SHR', 'SPX'])
export type SecurityStatus = z.infer<typeof SecurityStatus>

export const ScreeningExemption = z.enum(['BIOM', 'DIPL', 'LFSM', 'MAIL', 'NUCL', 'SMUS', 'TRNS'])
export type ScreeningExemption = z.infer<typeof ScreeningExemption>

export const RegulatedEntityCategoryCode = z.enum(['AO', 'KC', 'RA', 'RC'])
export type RegulatedEntityCategoryCode = z.infer<typeof RegulatedEntityCategoryCode>
