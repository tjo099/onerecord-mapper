import { describe, it } from 'vitest'

describe('deserialize -> wrong_type_for_endpoint', () => {
  it.skip('placeholder: wrong_type_for_endpoint is emitted by endpoint dispatch layer (Phase 15+ facade)', () => {
    // The kind exists for a higher-level facade (T76 createMapper) that knows
    // endpoint/type expectations. Per-class deserializers emit zod_validation
    // for the literal mismatch.
  })
})
