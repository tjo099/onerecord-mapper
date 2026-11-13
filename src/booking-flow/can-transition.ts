// src/booking-flow/can-transition.ts
import {
  type BookingAction,
  type BookingType,
  STATE_DIAGRAM,
  type Transition,
} from './state-diagram.js'

/**
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 */
export function canTransition(
  fromType: BookingType,
  fromStatus: string,
  action: BookingAction,
): Transition | null {
  const t = STATE_DIAGRAM[fromType]?.[fromStatus]?.[action]
  return t ?? null
}
