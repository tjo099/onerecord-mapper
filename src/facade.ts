// src/facade.ts
import { CLASSES, type ClassName } from './factory-classes.js'

/**
 * Namespaced static facade per spec §13. Use:
 *   import { onerecord } from '@flaks/onerecord'
 *   const r = onerecord.deserialize.Waybill(input)
 *   const wire = onerecord.serialize.Waybill(parsed)
 *
 * Each entry is the per-class deserialize/serialize function — NO bound state.
 * For state-bound (per-call limits, IRI strategy etc.), use `createMapper` instead.
 */
type DeserializerOf<C extends ClassName> = (input: unknown) => unknown
type SerializerOf<C extends ClassName> = (input: never) => unknown

const deserialize = {} as Record<ClassName, DeserializerOf<ClassName>>
const serialize = {} as Record<ClassName, SerializerOf<ClassName>>
for (const className of Object.keys(CLASSES) as ClassName[]) {
  const mod = CLASSES[className] as Record<string, unknown>
  deserialize[className] = mod[`deserialize${className}`] as DeserializerOf<ClassName>
  serialize[className] = mod[`serialize${className}`] as SerializerOf<ClassName>
}

export const onerecord = Object.freeze({
  deserialize: Object.freeze(deserialize),
  serialize: Object.freeze(serialize),
})
