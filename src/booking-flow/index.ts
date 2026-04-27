// src/booking-flow/index.ts
export { canTransition } from './can-transition.js'
export { STATE_DIAGRAM } from './state-diagram.js'
export type {
  BookingAction,
  BookingType,
  StateDiagram,
  Transition,
} from './state-diagram.js'
export {
  acceptBookingOption,
  acceptBookingRequest,
  rejectBookingOption,
  revokeBookingOption,
} from './transitions.js'
