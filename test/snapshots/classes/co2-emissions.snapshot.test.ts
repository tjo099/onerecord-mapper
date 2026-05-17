import { CO2EmissionsSchema, serializeCO2Emissions } from '../../../src/classes/co2-emissions/index.js'
import { createCO2Emissions } from '../../factories/co2-emissions.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'CO2Emissions',
  schema: CO2EmissionsSchema,
  serialize: serializeCO2Emissions,
  factory: createCO2Emissions,
})
