import {
  VerificationSchema,
  serializeVerification,
} from '../../../src/classes/verification/index.js'
import { createVerification } from '../../factories/verification.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Verification',
  schema: VerificationSchema,
  serialize: serializeVerification,
  factory: createVerification,
})
