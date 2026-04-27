import {
  ServerInformationSchema,
  serializeServerInformation,
} from '../../../src/classes/server-information/index.js'
import { createServerInformation } from '../../factories/server-information.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'ServerInformation',
  schema: ServerInformationSchema,
  serialize: serializeServerInformation,
  factory: createServerInformation,
})
