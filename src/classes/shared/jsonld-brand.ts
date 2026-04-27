// src/classes/shared/jsonld-brand.ts

declare const JsonLdBrand: unique symbol

/**
 * Per-class JSON-LD output brand. Each class's `JsonLd<Class>` uses this
 * with its `@type` literal in the second slot, so consumer code can
 * discriminate on `@type` while the brand prevents passing an arbitrary
 * `Record<string, unknown>` into a JsonLd-typed slot.
 *
 * v2 (A1-N4): wide `& Record<string, unknown>` intersection dropped — it made
 * every property access return `unknown`, defeating the brand's purpose.
 * Per-class JsonLd<Class> types augment with named fields where needed.
 */
export type JsonLd<TType extends string> = {
  '@context': string | string[]
  '@type': TType
  '@id': string
} & { readonly [JsonLdBrand]: TType }
