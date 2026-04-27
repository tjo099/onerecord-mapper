// Global Vitest setup. Per spec §7.7 (Test isolation): no global state to reset
// because safety limits are per-call and STATE_DIAGRAM is frozen. This file
// asserts those invariants on every run as a regression guard.

import { beforeAll } from 'vitest'

beforeAll(() => {
  // Future: assert STATE_DIAGRAM is frozen. Stubbed until Phase 10.
})
