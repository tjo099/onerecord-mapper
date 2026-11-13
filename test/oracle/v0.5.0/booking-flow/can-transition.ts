// FROZEN ORACLE: verbatim `git show v0.5.0:src/booking-flow/can-transition.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
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
