import type { Codec } from '../shared/codec.js'
import { deserializeSecurityDeclaration } from './deserialize.js'
import type { JsonLdSecurityDeclaration, SecurityDeclaration } from './schema.js'
import { SecurityDeclarationSchema } from './schema.js'
import { serializeSecurityDeclaration, serializeSecurityDeclarationStrict } from './serialize.js'

export const SecurityDeclarationCodec: Codec<
  SecurityDeclaration,
  JsonLdSecurityDeclaration,
  'SecurityDeclaration'
> = Object.freeze({
  schema: SecurityDeclarationSchema,
  serialize: serializeSecurityDeclaration,
  serializeStrict: serializeSecurityDeclarationStrict,
  deserialize: deserializeSecurityDeclaration,
  type: 'SecurityDeclaration',
} as const)
