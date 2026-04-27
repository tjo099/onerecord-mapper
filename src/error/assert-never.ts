// src/error/assert-never.ts

/**
 * Exhaustiveness helper. Compile-time: parameter type is `never`, so any
 * non-exhaustive switch breaks. Runtime: throws so escapes are loud.
 */
export function assertNever(x: never): never {
  throw new Error(`exhaustiveness check failed: ${JSON.stringify(x)}`)
}
