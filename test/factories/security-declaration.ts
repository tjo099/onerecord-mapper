import type { SecurityDeclaration } from '../../src/classes/security-declaration/schema.js'
import { envelope } from './common.js'

export type SecurityDeclarationFactoryShape = SecurityDeclaration

export function createSecurityDeclaration(
  overrides: Partial<SecurityDeclarationFactoryShape> = {},
): SecurityDeclarationFactoryShape {
  return {
    ...envelope('SecurityDeclaration'),
    '@type': 'SecurityDeclaration',
    securityStatus: 'SPX',
    screeningMethods: ['XRY'],
    issuedOn: '2026-04-30T08:00:00.000Z',
    ...overrides,
  } as SecurityDeclarationFactoryShape
}
