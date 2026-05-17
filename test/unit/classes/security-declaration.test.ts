import {
  SecurityDeclarationCodec,
  SecurityDeclarationSchema,
  deserializeSecurityDeclaration,
  serializeSecurityDeclaration,
  serializeSecurityDeclarationStrict,
} from '../../../src/classes/security-declaration/index.js'
import { createSecurityDeclaration } from '../../factories/security-declaration.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'SecurityDeclaration',
  schema: SecurityDeclarationSchema,
  serialize: serializeSecurityDeclaration,
  serializeStrict: serializeSecurityDeclarationStrict,
  deserialize: deserializeSecurityDeclaration,
  codec: SecurityDeclarationCodec,
  factory: createSecurityDeclaration,
})
