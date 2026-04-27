import {
  VerificationCodec,
  VerificationSchema,
  deserializeVerification,
  serializeVerification,
  serializeVerificationStrict,
} from '../../../src/classes/verification/index.js'
import { createVerification } from '../../factories/verification.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Verification',
  schema: VerificationSchema,
  serialize: serializeVerification,
  serializeStrict: serializeVerificationStrict,
  deserialize: deserializeVerification as (
    input: unknown,
    opts?: { allowedContexts?: readonly string[]; meta?: Record<string, unknown> },
  ) => import('../../../src/result.js').ParseResult<
    import('../../../src/classes/verification/index.js').Verification
  >,
  codec: VerificationCodec,
  factory: createVerification,
  invalidIriField: 'verifiedObject',
})
