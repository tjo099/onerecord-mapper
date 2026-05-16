import { describe, expect, it } from 'vitest'
import {
  CurrencyValueSchema,
  DimensionsSchema,
  OtherIdentifierSchema,
  ValueSchema,
} from '../../../../src/classes/shared/value.js'
describe('shared value sub-schemas', () => {
  it('Value = { numericalValue, unit }', () => {
    expect(ValueSchema.safeParse({ numericalValue: 120, unit: 'KGM' }).success).toBe(true)
    expect(ValueSchema.safeParse({ value: 120, unit: 'KGM' }).success).toBe(false) // legacy key rejected
  })
  it('CurrencyValue = { numericalValue, currencyUnit }', () => {
    expect(
      CurrencyValueSchema.safeParse({ numericalValue: 1000, currencyUnit: 'NOK' }).success,
    ).toBe(true)
  })
  it('Dimensions nests Value, no top-level unit', () => {
    expect(
      DimensionsSchema.safeParse({
        length: { numericalValue: 80, unit: 'CMT' },
        width: { numericalValue: 40, unit: 'CMT' },
      }).success,
    ).toBe(true)
    expect(DimensionsSchema.safeParse({ length: 80, unit: 'CMT' }).success).toBe(false)
  })
  it('OtherIdentifier = { otherIdentifierType, textualValue }', () => {
    expect(
      OtherIdentifierSchema.safeParse({
        otherIdentifierType: 'BARCODE',
        textualValue: '70190061521001',
      }).success,
    ).toBe(true)
  })
})
