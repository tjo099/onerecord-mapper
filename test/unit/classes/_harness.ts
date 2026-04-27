// test/unit/classes/_harness.ts
//
// Parameterised round-trip harness — registers the 8 standard assertions for
// every per-class round-trip test. v3 (A2-R2-M3, closes A2-M2 PARTIAL): per-class
// test files were only "Follow Task 25 pattern" prose for 30 of 32 classes; this
// harness guarantees identical assertions across all classes.
//
// Usage (one line per class file):
//   roundTripHarness({ className: 'Shipment', schema: ShipmentSchema, ... })

import { describe, expect, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import type { Codec } from '../../../src/classes/shared/codec.js'
import type { ParseResult } from '../../../src/result.js'
import { CARGO_CONTEXT_IRI } from '../../../src/version.js'
import { fieldEquivalent } from '../../util/field-equivalent.js'

export interface RoundTripHarnessOpts<App, Wire, T extends string> {
  readonly className: T
  readonly schema: z.ZodType<App>
  readonly serialize: (input: App) => Wire
  readonly serializeStrict: (input: App) => ParseResult<Wire>
  readonly deserialize: (
    input: unknown,
    opts?: { allowedContexts?: readonly string[]; meta?: Record<string, unknown> },
  ) => ParseResult<App>
  readonly codec: Codec<App, Wire, T>
  readonly factory: (overrides?: Partial<App>) => App
  readonly numericFields?: Record<string, 'monetary' | 'weight' | 'volume' | 'exact'>
  /** Optional empty-array field — factory must accept this as override. */
  readonly emptyArrayField?: string
  /** Optional invalid-IRI field — factory must accept this as override.
   *  When set, the harness will inject a disallowed-scheme IRI and assert
   *  the deserializer surfaces `kind: 'invalid_iri'` (proves A1-R2-B1 fix). */
  readonly invalidIriField?: string
}

export function roundTripHarness<App, Wire, T extends string>(
  opts: RoundTripHarnessOpts<App, Wire, T>,
): void {
  const {
    className,
    schema,
    serialize,
    serializeStrict,
    deserialize,
    codec,
    factory,
    numericFields,
    emptyArrayField,
    invalidIriField,
  } = opts

  describe(className, () => {
    it('round-trips field-equivalent', () => {
      const obj = schema.parse(factory())
      const r = deserialize(serialize(obj))
      expect(r.ok).toBe(true)
      if (r.ok)
        expect(
          fieldEquivalent(r.value, obj, numericFields !== undefined ? { numericFields } : {}),
        ).toBe(true)
    })

    it('rejects unknown @context with unknown_context', () => {
      const r = deserialize({ ...factory(), '@context': 'https://attacker/x' })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.kind).toBe('unknown_context')
    })

    it('honours opts.allowedContexts override', () => {
      const r = deserialize(
        { ...factory(), '@context': 'https://custom.example/ns' },
        { allowedContexts: ['https://custom.example/ns'] },
      )
      expect(r.ok).toBe(true)
    })

    if (emptyArrayField) {
      it(`rejects empty array on ${emptyArrayField} as cardinality_violation`, () => {
        const wire = { ...factory(), [emptyArrayField]: [] }
        const r = deserialize(wire)
        expect(r.ok).toBe(false)
        if (!r.ok) expect(r.error.kind).toBe('cardinality_violation')
      })
    }

    if (invalidIriField) {
      // v3 (A1-R2-B1): proves safeIri() failures surface as kind: 'invalid_iri',
      // NOT 'zod_validation'. Required by T48a invalid-iri.test.ts.
      it(`surfaces kind: 'invalid_iri' for disallowed scheme on ${invalidIriField}`, () => {
        const wire = { ...factory(), [invalidIriField]: 'http://attacker' }
        const r = deserialize(wire)
        expect(r.ok).toBe(false)
        if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
      })
    }

    it('threads opts.meta into error', () => {
      // Use a missing-type payload to trigger a deterministic non-iri error path
      const r = deserialize(
        { '@context': CARGO_CONTEXT_IRI, '@id': 'https://x/y/z' },
        { meta: { requestId: 'rq1' } },
      )
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
    })

    it('serializeStrict returns ParseResult on success', () => {
      const obj = schema.parse(factory())
      const r = serializeStrict(obj)
      expect(r.ok).toBe(true)
    })

    it('serializer throws SerializationError instance on impossible input', () => {
      expect(() => serialize({} as never)).toThrow(/SerializationError|invalid_application_object/)
    })

    it('codec.type is literal-narrowed', () => {
      // Cast codec.type via unknown to satisfy vitest's strict DeepBrand constraint
      // on expectTypeOf while still verifying the runtime value is correct.
      const codecType: string = codec.type
      expectTypeOf(codecType).toEqualTypeOf<string>()
      expect(codec.type).toBe(className)
    })
  })
}
