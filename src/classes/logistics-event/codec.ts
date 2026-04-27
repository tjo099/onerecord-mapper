import type { Codec } from '../shared/codec.js'
import { deserializeLogisticsEvent } from './deserialize.js'
import type { JsonLdLogisticsEvent, LogisticsEvent } from './schema.js'
import { LogisticsEventSchema } from './schema.js'
import { serializeLogisticsEvent, serializeLogisticsEventStrict } from './serialize.js'

export const LogisticsEventCodec: Codec<LogisticsEvent, JsonLdLogisticsEvent, 'LogisticsEvent'> =
  Object.freeze({
    schema: LogisticsEventSchema,
    serialize: serializeLogisticsEvent,
    serializeStrict: serializeLogisticsEventStrict,
    deserialize: deserializeLogisticsEvent,
    type: 'LogisticsEvent',
  } as const)
