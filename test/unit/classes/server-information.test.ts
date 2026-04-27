import {
  ServerInformationCodec,
  ServerInformationSchema,
  deserializeServerInformation,
  serializeServerInformation,
  serializeServerInformationStrict,
} from '../../../src/classes/server-information/index.js'
import { createServerInformation } from '../../factories/server-information.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'ServerInformation',
  schema: ServerInformationSchema,
  serialize: serializeServerInformation,
  serializeStrict: serializeServerInformationStrict,
  deserialize: deserializeServerInformation,
  codec: ServerInformationCodec,
  factory: createServerInformation,
  emptyArrayField: 'supportedLogisticsObjectTypes',
  invalidIriField: 'serverEndpoint',
})
