import type { Codec } from '../shared/codec.js'
import { deserializeVerification } from './deserialize.js'
import type { JsonLdVerification, Verification } from './schema.js'
import { VerificationSchema } from './schema.js'
import { serializeVerification, serializeVerificationStrict } from './serialize.js'

/**
 * v0.1.0 codec stays typed as `Verification` (not UnverifiedVerification) on
 * the App side because consumers writing OUTBOUND payloads pass plain
 * Verifications. The deserialize function narrows to UnverifiedVerification
 * for INBOUND values per spec §3.1; consumers re-brand to verified after
 * cryptographic verification (out of scope for v0.1.0).
 *
 * The harness's `roundTripHarness` invocation passes `deserializeVerification`,
 * which returns ParseResult<UnverifiedVerification>; structurally that
 * conforms to ParseResult<Verification> because UnverifiedVerification extends
 * Verification, so the round-trip + meta + invalidIri assertions still work.
 */
export const VerificationCodec: Codec<Verification, JsonLdVerification, 'Verification'> =
  Object.freeze({
    schema: VerificationSchema,
    serialize: serializeVerification,
    serializeStrict: serializeVerificationStrict,
    deserialize: deserializeVerification as (
      input: unknown,
      opts?: import('../../safety/limits.js').DeserializeOpts,
    ) => import('../../result.js').ParseResult<Verification>,
    type: 'Verification',
  } as const)
