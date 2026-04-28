import { CLASSES, type ClassName } from '../factory-classes.js'
import type { ParseResult } from '../result.js'
import { dispatchGraphWalk } from './graph-walk.js'

/**
 * Build the per-class deserialize map by wrapping each module's
 * `deserialize<ClassName>` function with the graph-walk pre-pass.
 *
 * Failure of the graph-walk pre-pass returns the underlying ParseError
 * untouched; per-class Zod validation only runs if the pre-pass passes.
 */
type DispatchDeserializeMap = {
  readonly [C in ClassName]: (raw: unknown) => ParseResult<unknown>
}

function buildDispatchDeserialize(): DispatchDeserializeMap {
  const out = {} as Record<ClassName, (raw: unknown) => ParseResult<unknown>>
  for (const className of Object.keys(CLASSES) as ClassName[]) {
    const mod = CLASSES[className] as Record<string, unknown>
    const fn = mod[`deserialize${className}`] as
      | ((input: unknown) => ParseResult<unknown>)
      | undefined
    if (typeof fn !== 'function') {
      throw new Error(
        `dispatch: deserialize${className} not found on module — check src/factory-classes.ts and src/classes/${className.toLowerCase()}/index.ts`,
      )
    }
    out[className] = (raw: unknown): ParseResult<unknown> => {
      const walkR = dispatchGraphWalk(raw, className)
      if (!walkR.ok) return walkR
      return fn(raw)
    }
  }
  return out
}

/**
 * Opt-in dispatch facade per spec §13. Use:
 *   import { dispatch } from '@flaks/onerecord'
 *   const r = dispatch.deserialize.Waybill(input)
 *
 * Each per-class deserializer runs the graph-walk pre-pass before
 * delegating to the per-class Zod schema. The default per-class
 * deserializers (`WaybillCodec.deserialize`, `onerecord.deserialize.Waybill`)
 * are unchanged — graph-walk is opt-in.
 *
 * For state-bound graph-walk (per-call limits, IRI strategy etc.), use
 * `createMapper({ graphWalk: true })` instead.
 */
export const dispatch = Object.freeze({
  deserialize: Object.freeze(buildDispatchDeserialize()),
})
