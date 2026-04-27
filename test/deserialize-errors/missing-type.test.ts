import { describe, it } from 'vitest'

describe('deserialize -> missing_type', () => {
  it.skip('placeholder: missing_type emission path (currently surfaces as zod_validation; reserved for higher-level dispatch)', () => {
    // The kind exists in the union; per-class deserializers currently emit zod_validation
    // for missing/wrong @type via the Zod literal check.
  })
})
