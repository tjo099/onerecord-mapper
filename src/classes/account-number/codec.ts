import type { Codec } from '../shared/codec.js'
import { deserializeAccountNumber } from './deserialize.js'
import type { AccountNumber, JsonLdAccountNumber } from './schema.js'
import { AccountNumberSchema } from './schema.js'
import { serializeAccountNumber, serializeAccountNumberStrict } from './serialize.js'

export const AccountNumberCodec: Codec<AccountNumber, JsonLdAccountNumber, 'AccountNumber'> =
  Object.freeze({
    schema: AccountNumberSchema,
    serialize: serializeAccountNumber,
    serializeStrict: serializeAccountNumberStrict,
    deserialize: deserializeAccountNumber,
    type: 'AccountNumber',
  } as const)
