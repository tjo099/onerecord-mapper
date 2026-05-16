import type { OtherCharge } from '../../src/classes/other-charge/schema.js'
import { envelope } from './common.js'
export type OtherChargeFactoryShape = OtherCharge
export function createOtherCharge(
  overrides: Partial<OtherChargeFactoryShape> = {},
): OtherChargeFactoryShape {
  return {
    ...envelope('OtherCharge'),
    '@type': 'OtherCharge',
    otherChargeCode: 'MY',
    ...overrides,
  } as OtherChargeFactoryShape
}
