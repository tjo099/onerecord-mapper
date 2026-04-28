import { dispatchGraphWalk } from './dispatch/graph-walk.js'
import { CLASSES, type ClassName } from './factory-classes.js'
import { defaultIriStrategy } from './iri/default-strategy.js'
import type { IriStrategy } from './iri/strategy.js'
import type { ParseResult } from './result.js'
// src/factory.ts
import type { DeserializeOpts, SafetyLimits } from './safety/limits.js'
import { mergeLimits } from './safety/limits.js'
import { deepFreeze } from './util/deep-freeze.js'

export interface CreateMapperOpts {
  limits?: Partial<SafetyLimits>
  iriStrategy?: IriStrategy
  allowedSchemes?: readonly string[]
  /**
   * When `true`, every bound `deserialize<Class>` method runs the
   * graph-walk pre-pass (cross-node integrity checks: duplicate_id,
   * missing_id, missing_type, wrong_type_for_endpoint) before
   * delegating to the per-class Zod validator. Default: `false`
   * (preserves v0.1.x behavior).
   *
   * Same shape as Zod's `safeParse` vs `parse` — strictness is opt-in;
   * the type-system contract is preserved (consumers exhaustively
   * handling all 22 ParseError kinds work either way).
   */
  graphWalk?: boolean
}

/**
 * Bound-method mapper. Every method is a closure over deep-frozen options
 * captured at `createMapper` time — subsequent mutation of the input `opts`
 * object has NO effect on bound methods.
 *
 * **Thread / structured-clone semantics (spec §14 Q5, v3 — A3-R2-m2):**
 * `Mapper` is NOT directly structured-cloneable (function values throw
 * `DataCloneError` in standards-compliant `structuredClone`). The Mapper's
 * **state** is plain data and CAN be transferred:
 *
 *   const state = { limits: m.limits, allowedSchemes: m.iriStrategy.allowedSchemes }
 *   const wireSafe = structuredClone(state)
 *   // on the receiving side:
 *   const m2 = createMapper(wireSafe)
 *
 * Bound methods themselves are not cloneable; reconstruct via createMapper
 * on the receiving side.
 *
 * **Mapper interface shape (v3 — A1-R2-M3):** 32 deserialize + 32 serialize
 * methods are derived from the `CLASSES` map (src/factory-classes.ts) via
 * mapped types. Adding a class to the registry automatically extends Mapper.
 */
export type Mapper = {
  readonly limits: Readonly<SafetyLimits>
  readonly iriStrategy: Readonly<IriStrategy>
} & {
  // For each ClassName C, generate `deserialize<C>` and `serialize<C>` methods.
  // The exact App/Wire types come from the CLASSES module's exports.
  readonly [C in ClassName as `deserialize${C}`]: (input: unknown) => ParseResult<unknown>
} & {
  readonly [C in ClassName as `serialize${C}`]: (input: never) => unknown
}

export function createMapper(opts: CreateMapperOpts = {}): Mapper {
  // v2 (A1-B4): freeze the merged limits at creation time.
  const limits = mergeLimits(opts.limits) // returns Readonly<SafetyLimits>
  // v3 (A1-R2-M4): deep-freeze iriStrategy so consumer mutation of
  // customStrategy.allowedSchemes.push('javascript') after createMapper
  // does NOT leak into bound serializers.
  const iriStrategy = deepFreeze(opts.iriStrategy ?? defaultIriStrategy)
  const baseDes: Readonly<DeserializeOpts> = Object.freeze({ limits })
  const baseSer = Object.freeze({ iri: iriStrategy })

  // v3 (A1-R2-M3): synthesise method bindings via the typed CLASSES map.
  const out: Record<string, unknown> = { limits, iriStrategy }
  for (const className of Object.keys(CLASSES) as ClassName[]) {
    const mod = CLASSES[className] as Record<string, unknown>
    const deserializeFn = mod[`deserialize${className}`] as
      | ((input: unknown, opts?: DeserializeOpts) => unknown)
      | undefined
    const serializeFn = mod[`serialize${className}`] as
      | ((input: unknown, opts?: { iri?: IriStrategy }) => unknown)
      | undefined
    if (typeof deserializeFn !== 'function') {
      throw new Error(
        `createMapper: deserialize${className} not found on module — check src/factory-classes.ts and src/classes/${className.toLowerCase()}/index.ts`,
      )
    }
    if (typeof serializeFn !== 'function') {
      throw new Error(`createMapper: serialize${className} not found on module`)
    }
    const baseDeserialize = (input: unknown) => deserializeFn(input, baseDes)
    out[`deserialize${className}`] = opts.graphWalk
      ? (input: unknown) => {
          const walkR = dispatchGraphWalk(input, className)
          if (!walkR.ok) return walkR
          return baseDeserialize(input)
        }
      : baseDeserialize
    out[`serialize${className}`] = (input: never) => serializeFn(input, baseSer)
  }

  return Object.freeze(out) as Mapper
}
