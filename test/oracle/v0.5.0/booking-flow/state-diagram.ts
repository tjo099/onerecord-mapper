// FROZEN ORACLE: verbatim `git show v0.5.0:src/booking-flow/state-diagram.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
// src/booking-flow/state-diagram.ts
import { deepFreeze } from '../../../../src/util/deep-freeze.js'

export type BookingType = 'BookingRequest' | 'BookingOption' | 'BookingOptionRequest' | 'Booking'
export type BookingAction = 'accept' | 'reject' | 'revoke' | 'modify'

export interface Transition {
  readonly nextType: BookingType
  readonly nextStatus: string
  readonly terminal?: boolean
}

type Cell = Transition | undefined

export interface StateDiagram {
  readonly [fromType: string]: {
    readonly [fromStatus: string]: {
      readonly [action in BookingAction]?: Cell
    }
  }
}

/** v2 (A1 risk #2): deepFreeze covers leaf Transition objects so STATE_DIAGRAM.X.Y.Z.accept.nextType = '...' fails at runtime. */
export const STATE_DIAGRAM: StateDiagram = deepFreeze({
  BookingRequest: {
    REQUEST_PENDING: {
      accept: { nextType: 'BookingOption', nextStatus: 'REQUEST_PENDING' },
      reject: { nextType: 'BookingRequest', nextStatus: 'REQUEST_REJECTED', terminal: true },
      revoke: { nextType: 'BookingRequest', nextStatus: 'REQUEST_REVOKED', terminal: true },
    },
  },
  BookingOption: {
    REQUEST_PENDING: {
      accept: { nextType: 'BookingOptionRequest', nextStatus: 'REQUEST_PENDING' },
      reject: { nextType: 'BookingOption', nextStatus: 'REQUEST_REJECTED', terminal: true },
      revoke: { nextType: 'BookingOption', nextStatus: 'REQUEST_REVOKED', terminal: true },
      modify: { nextType: 'BookingOption', nextStatus: 'REQUEST_PENDING' },
    },
  },
  BookingOptionRequest: {
    REQUEST_PENDING: {
      accept: { nextType: 'Booking', nextStatus: 'REQUEST_ACCEPTED' },
      reject: { nextType: 'BookingOptionRequest', nextStatus: 'REQUEST_REJECTED', terminal: true },
      revoke: { nextType: 'BookingOptionRequest', nextStatus: 'REQUEST_REVOKED', terminal: true },
      modify: { nextType: 'BookingOption', nextStatus: 'REQUEST_PENDING' },
    },
  },
  Booking: {
    REQUEST_ACCEPTED: {
      revoke: { nextType: 'Booking', nextStatus: 'REQUEST_REVOKED', terminal: true },
    },
  },
})
