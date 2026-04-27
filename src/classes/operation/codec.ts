import type { Codec } from '../shared/codec.js'
import { deserializeOperation } from './deserialize.js'
import type { JsonLdOperation, Operation } from './schema.js'
import { OperationSchema } from './schema.js'
import { serializeOperation, serializeOperationStrict } from './serialize.js'

export const OperationCodec: Codec<Operation, JsonLdOperation, 'Operation'> = Object.freeze({
  schema: OperationSchema,
  serialize: serializeOperation,
  serializeStrict: serializeOperationStrict,
  deserialize: deserializeOperation,
  type: 'Operation',
} as const)
