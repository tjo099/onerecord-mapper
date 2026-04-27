import {
  VerificationRequestCodec,
  VerificationRequestSchema,
  deserializeVerificationRequest,
  serializeVerificationRequest,
  serializeVerificationRequestStrict,
} from '../../../src/classes/verification-request/index.js'
import { createVerificationRequest } from '../../factories/verification-request.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'VerificationRequest',
  schema: VerificationRequestSchema,
  serialize: serializeVerificationRequest,
  serializeStrict: serializeVerificationRequestStrict,
  deserialize: deserializeVerificationRequest,
  codec: VerificationRequestCodec,
  factory: createVerificationRequest,
  invalidIriField: 'verification',
})
