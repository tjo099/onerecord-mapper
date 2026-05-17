import {
  CO2EmissionsCodec,
  CO2EmissionsSchema,
  deserializeCO2Emissions,
  serializeCO2Emissions,
  serializeCO2EmissionsStrict,
} from '../../../src/classes/co2-emissions/index.js'
import { createCO2Emissions } from '../../factories/co2-emissions.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'CO2Emissions',
  schema: CO2EmissionsSchema,
  serialize: serializeCO2Emissions,
  serializeStrict: serializeCO2EmissionsStrict,
  deserialize: deserializeCO2Emissions,
  codec: CO2EmissionsCodec,
  factory: createCO2Emissions,
})
