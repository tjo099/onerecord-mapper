import {
  VerificationRequestSchema,
  serializeVerificationRequest,
} from '../../../src/classes/verification-request/index.js'
import { createVerificationRequest } from '../../factories/verification-request.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'VerificationRequest',
  schema: VerificationRequestSchema,
  serialize: serializeVerificationRequest,
  factory: createVerificationRequest,
})
