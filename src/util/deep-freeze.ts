/**
 * Recursively freeze an object and every nested object/array.
 * Used by STATE_DIAGRAM (Task 54) and createMapper bound limits (Task 76)
 * so that nested mutation (e.g. STATE_DIAGRAM.X.Y.Z.accept.nextType = 'Pwn')
 * is rejected at runtime, not just at compile time via `as const`.
 */
export function deepFreeze<T>(value: T): Readonly<T> {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item)
  } else {
    for (const k of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[k])
    }
  }
  return Object.freeze(value)
}
