import type { Codec } from '../shared/codec.js'
import { deserializeCO2Emissions } from './deserialize.js'
import type { CO2Emissions, JsonLdCO2Emissions } from './schema.js'
import { CO2EmissionsSchema } from './schema.js'
import { serializeCO2Emissions, serializeCO2EmissionsStrict } from './serialize.js'

export const CO2EmissionsCodec: Codec<CO2Emissions, JsonLdCO2Emissions, 'CO2Emissions'> =
  Object.freeze({
    schema: CO2EmissionsSchema,
    serialize: serializeCO2Emissions,
    serializeStrict: serializeCO2EmissionsStrict,
    deserialize: deserializeCO2Emissions,
    type: 'CO2Emissions',
  } as const)
