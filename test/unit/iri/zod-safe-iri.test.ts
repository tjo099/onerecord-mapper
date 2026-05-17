// test/unit/iri/zod-safe-iri.test.ts
import { describe, expect, expectTypeOf, it } from 'vitest'
import type { SafeIri } from '../../../src/iri/strategy.js'
import {
  extractInvalidIriIssue,
  findInvalidIriInIssues,
  safeIri,
} from '../../../src/iri/zod-safe-iri.js'

describe('safeIri()', () => {
  it('produces a Zod schema that yields branded SafeIri', () => {
    const sch = safeIri()
    const r = sch.safeParse('https://flaks.example/t1/waybill/u1')
    expect(r.success).toBe(true)
    if (r.success) expectTypeOf(r.data).toEqualTypeOf<SafeIri>()
  })

  it('rejects http:// (default ["https"])', () => {
    expect(safeIri().safeParse('http://x/y').success).toBe(false)
  })

  it('rejects javascript:', () => {
    expect(safeIri().safeParse('javascript:alert(1)').success).toBe(false)
  })

  it('honours custom allowedSchemes', () => {
    expect(safeIri({ allowedSchemes: ['urn'] }).safeParse('urn:uuid:abc').success).toBe(true)
  })

  it('emits a structured params payload on failure (v3 — A1-R2-B1)', () => {
    const r = safeIri().safeParse('http://attacker')
    expect(r.success).toBe(false)
    if (!r.success) {
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      const issue = r.error.issues[0]!
      expect(issue.code).toBe('custom')
      expect(issue.message).toBe('invalid_iri')
      const params = (issue as { params?: Record<string, unknown> }).params
      expect(params).toBeDefined()
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(params!.__safe_iri__).toBe(true)
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(params!.kind).toBe('invalid_iri')
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(params!.reason).toBe('disallowed_scheme')
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(params!.got).toBe('http://attacker')
    }
  })

  it('extractInvalidIriIssue lifts a tagged issue into a ParseError (v3)', () => {
    const r = safeIri().safeParse('http://attacker')
    if (!r.success) {
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      const issue = r.error.issues[0]!
      const extracted = extractInvalidIriIssue(issue, '$.shipmentInformation')
      expect(extracted).not.toBeNull()
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(extracted!.kind).toBe('invalid_iri')
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(extracted!.reason).toBe('disallowed_scheme')
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(extracted!.got).toBe('http://attacker')
      // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
      expect(extracted!.path).toBe('$.shipmentInformation')
    }
  })

  it('extractInvalidIriIssue returns null for unrelated issues (v3)', () => {
    const fakeIssue = { code: 'invalid_string' as const, message: 'bad', path: ['x'] }
    expect(extractInvalidIriIssue(fakeIssue as never, '$.x')).toBeNull()
  })

  it('findInvalidIriInIssues prepends envelope path (v3)', () => {
    // Synthesise a Zod-style issues array with one safeIri issue at path ["referredBookingOption"]
    const issues = [
      {
        code: 'custom' as const,
        message: 'invalid_iri',
        path: ['referredBookingOption'],
        params: {
          __safe_iri__: true,
          kind: 'invalid_iri',
          got: 'http://x',
          reason: 'disallowed_scheme',
        },
      },
    ]
    const result = findInvalidIriInIssues(issues, '$')
    expect(result).not.toBeNull()
    // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
    expect(result!.path).toBe('$.referredBookingOption')
  })

  it('findInvalidIriInIssues recurses into invalid_union nested errors — positive (1b.9)', () => {
    // Synthesise an invalid_union issue (e.g. partyDetails IdRef union) whose first arm
    // contains a safeIri-tagged custom issue and whose second arm is a non-safeIri issue.
    // Without the invalid_union recursion branch the positive test would return null.
    const issues = [
      {
        code: 'invalid_union' as const,
        message: 'Invalid input',
        path: ['partyDetails'] as PropertyKey[],
        errors: [
          [
            {
              code: 'custom' as const,
              message: 'invalid_iri',
              path: [] as PropertyKey[],
              params: {
                __safe_iri__: true,
                kind: 'invalid_iri',
                got: 'http://attacker',
                reason: 'disallowed_scheme',
              },
            },
          ],
          [
            {
              code: 'invalid_type' as const,
              message: 'Expected object, received string',
              path: [] as PropertyKey[],
            },
          ],
        ],
      },
    ]
    const r = findInvalidIriInIssues(issues, '$')
    expect(r).not.toBeNull()
    // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
    expect(r!.kind).toBe('invalid_iri')
    // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
    expect(r!.path).toBe('$.partyDetails')
    // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
    expect(r!.got).toBe('http://attacker')
    // biome-ignore lint/style/noNonNullAssertion: test asserts post-precondition
    expect(r!.reason).toBe('disallowed_scheme')
  })

  it('findInvalidIriInIssues returns null for invalid_union with no safeIri arm — negative (1b.9)', () => {
    // All union arms are non-safeIri issues; recursion should find nothing and return null.
    const issues = [
      {
        code: 'invalid_union' as const,
        message: 'Invalid input',
        path: ['partyDetails'] as PropertyKey[],
        errors: [
          [
            {
              code: 'invalid_type' as const,
              message: 'Expected string, received object',
              path: [] as PropertyKey[],
            },
          ],
          [
            {
              code: 'invalid_type' as const,
              message: 'Expected object, received string',
              path: [] as PropertyKey[],
            },
          ],
        ],
      },
    ]
    expect(findInvalidIriInIssues(issues, '$')).toBeNull()
  })
})
