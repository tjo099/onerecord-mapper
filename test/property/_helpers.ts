import * as fc from 'fast-check'
import { type EquivOpts, fieldEquivalent } from '../util/field-equivalent.js'

interface Codec<T> {
  serialize: (obj: T) => unknown
  deserialize: (raw: unknown) => { ok: true; value: T } | { ok: false; error: unknown }
}

interface Schema<T> {
  parse: (raw: unknown) => T
}

export interface RoundTripPropertyOpts<T> {
  arbitrary: fc.Arbitrary<unknown>
  codec: Codec<T>
  schema: Schema<T>
  numericFields?: EquivOpts['numericFields']
  numRuns?: number
}

/**
 * Asserts the round-trip property: for any value the arbitrary produces,
 * `serialize` then `deserialize` returns a field-equivalent value
 * (canonical-form equality per spec §7.1).
 *
 * Usage:
 *   roundTripProperty({
 *     arbitrary: shipmentArb,
 *     codec: { serialize: serializeShipment, deserialize: deserializeShipment },
 *     schema: ShipmentSchema,
 *     numericFields: { 'totalGrossWeight.value': 'weight' },
 *   })
 *
 * The arbitrary may produce values with `undefined` keys (fast-check's
 * `fc.option(..., { nil: undefined })`); those are stripped before passing
 * to the schema parser to satisfy `exactOptionalPropertyTypes`.
 */
export function roundTripProperty<T>(opts: RoundTripPropertyOpts<T>): void {
  fc.assert(
    fc.property(opts.arbitrary, (input) => {
      const cleaned: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        if (v !== undefined) cleaned[k] = v
      }
      const obj = opts.schema.parse(cleaned) as T
      const wire = opts.codec.serialize(obj)
      const r = opts.codec.deserialize(wire)
      if (!r.ok) return false
      return fieldEquivalent(r.value, obj, {
        numericFields: opts.numericFields ?? {},
      })
    }),
    { numRuns: opts.numRuns ?? 100 },
  )
}

/**
 * Reusable arbitrary for safeIri-shaped values (https URLs scoped to
 * the test tenant).
 */
export function iriArb(typeNameLowerCase: string): fc.Arbitrary<string> {
  return fc.uuid().map((u) => `https://test.flaks.example/test-tenant/${typeNameLowerCase}/${u}`)
}

/** Reusable arbitrary for KGM weights with non-negative value. */
export const weightArb = fc.record({
  unit: fc.constant('KGM' as const),
  value: fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
})

/** Reusable arbitrary for MTQ volumes. */
export const volumeArb = fc.record({
  unit: fc.constant('MTQ' as const),
  value: fc.float({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true }),
})
