import type { CustomsInformation } from '../../src/classes/customs-information/schema.js'
import { envelope } from './common.js'

export type CustomsInformationFactoryShape = CustomsInformation

export function createCustomsInformation(
  overrides: Partial<CustomsInformationFactoryShape> = {},
): CustomsInformationFactoryShape {
  return {
    ...envelope('CustomsInformation'),
    '@type': 'CustomsInformation',
    ociLineNumber: 1,
    ...overrides,
  } as CustomsInformationFactoryShape
}
