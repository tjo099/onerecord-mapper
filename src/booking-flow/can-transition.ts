// src/booking-flow/can-transition.ts
import {
  type BookingAction,
  type BookingType,
  STATE_DIAGRAM,
  type Transition,
} from './state-diagram.js'

export function canTransition(
  fromType: BookingType,
  fromStatus: string,
  action: BookingAction,
): Transition | null {
  const t = STATE_DIAGRAM[fromType]?.[fromStatus]?.[action]
  return t ?? null
}
