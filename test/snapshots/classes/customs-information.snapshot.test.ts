import {
  CustomsInformationSchema,
  serializeCustomsInformation,
} from '../../../src/classes/customs-information/index.js'
import { createCustomsInformation } from '../../factories/customs-information.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'CustomsInformation',
  schema: CustomsInformationSchema,
  serialize: serializeCustomsInformation,
  factory: createCustomsInformation,
})
