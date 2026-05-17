import { SecurityDeclarationSchema, serializeSecurityDeclaration } from '../../../src/classes/security-declaration/index.js'
import { createSecurityDeclaration } from '../../factories/security-declaration.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'SecurityDeclaration',
  schema: SecurityDeclarationSchema,
  serialize: serializeSecurityDeclaration,
  factory: createSecurityDeclaration,
})
