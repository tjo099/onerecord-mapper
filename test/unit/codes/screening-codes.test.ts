import { describe, expect, it } from 'vitest'
import {
  RegulatedEntityCategoryCode,
  ScreeningExemption,
  ScreeningMethod,
  SecurityStatus,
} from '../../../src/codes/enums.js'

describe('ScreeningMethod (CL v1.1.0)', () => {
  const tokens = ['AOM', 'CMD', 'EDD', 'EDS', 'ETD', 'PHS', 'VCK', 'XRY'] as const

  it('accepts every valid token', () => {
    for (const token of tokens) {
      expect(ScreeningMethod.safeParse(token).success).toBe(true)
    }
  })

  it('rejects an unknown token', () => {
    expect(ScreeningMethod.safeParse('XXX').success).toBe(false)
  })
})

describe('SecurityStatus (CL v1.1.0)', () => {
  const tokens = ['NSC', 'SCO', 'SHR', 'SPX'] as const

  it('accepts every valid token', () => {
    for (const token of tokens) {
      expect(SecurityStatus.safeParse(token).success).toBe(true)
    }
  })

  it('rejects an unknown token', () => {
    expect(SecurityStatus.safeParse('XXX').success).toBe(false)
  })
})

describe('ScreeningExemption (CL v1.1.0)', () => {
  const tokens = ['BIOM', 'DIPL', 'LFSM', 'MAIL', 'NUCL', 'SMUS', 'TRNS'] as const

  it('accepts every valid token', () => {
    for (const token of tokens) {
      expect(ScreeningExemption.safeParse(token).success).toBe(true)
    }
  })

  it('rejects an unknown token', () => {
    expect(ScreeningExemption.safeParse('XXX').success).toBe(false)
  })
})

describe('RegulatedEntityCategoryCode (CL v1.1.0)', () => {
  const tokens = ['AO', 'KC', 'RA', 'RC'] as const

  it('accepts every valid token', () => {
    for (const token of tokens) {
      expect(RegulatedEntityCategoryCode.safeParse(token).success).toBe(true)
    }
  })

  it('rejects an unknown token', () => {
    expect(RegulatedEntityCategoryCode.safeParse('XXX').success).toBe(false)
  })
})
