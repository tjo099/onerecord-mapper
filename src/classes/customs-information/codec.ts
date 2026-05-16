import type { Codec } from '../shared/codec.js'
import { deserializeCustomsInformation } from './deserialize.js'
import type { CustomsInformation, JsonLdCustomsInformation } from './schema.js'
import { CustomsInformationSchema } from './schema.js'
import { serializeCustomsInformation, serializeCustomsInformationStrict } from './serialize.js'

export const CustomsInformationCodec: Codec<
  CustomsInformation,
  JsonLdCustomsInformation,
  'CustomsInformation'
> = Object.freeze({
  schema: CustomsInformationSchema,
  serialize: serializeCustomsInformation,
  serializeStrict: serializeCustomsInformationStrict,
  deserialize: deserializeCustomsInformation,
  type: 'CustomsInformation',
} as const)
