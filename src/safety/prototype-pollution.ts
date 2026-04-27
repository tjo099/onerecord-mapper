import type { ParseResult } from '../result.js'

const FORBIDDEN_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
])

/**
 * Per spec §6.5.2 + v3 expansion: reject any key that matches a forbidden
 * pattern after Unicode NFKC normalization. NFKC handles full-width and
 * compatibility variants that look identical to humans.
 *
 * Spec amendment note: NFKC (compatibility decomposition) is strictly stronger
 * than spec §6.5.2 step 3's NFC. NFKC catches full-width Unicode confusables
 * like `＿＿proto＿＿`. This is documented under "Spec amendment candidates" §1.
 */
export function isForbiddenKey(key: string): boolean {
  const normalized = key.normalize('NFKC')
  return FORBIDDEN_KEYS.has(normalized)
}

/**
 * Walk an unknown input and reject if any property key is forbidden, any
 * Symbol-keyed property is enumerable, or any accessor (getter/setter) is
 * present. Operates on plain objects + arrays only — primitive leaves
 * are skipped.
 */
export function scanForPollution(input: unknown, path: string): ParseResult<true> {
  if (input === null || typeof input !== 'object') {
    return { ok: true, value: true }
  }

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const r = scanForPollution(input[i], `${path}[${i}]`)
      if (!r.ok) return r
    }
    return { ok: true, value: true }
  }

  const obj = input as Record<string | symbol, unknown>

  // Symbol keys (v2 A1-m5: use optional chaining + nullish coalescing instead of non-null assertion)
  const syms = Object.getOwnPropertySymbols(obj)
  if (syms.length > 0) {
    return {
      ok: false,
      error: {
        kind: 'prototype_pollution_attempt',
        key: syms[0]?.toString() ?? '<symbol>',
        path,
      },
    }
  }

  // String keys
  for (const k of Object.getOwnPropertyNames(obj)) {
    if (isForbiddenKey(k)) {
      return { ok: false, error: { kind: 'prototype_pollution_attempt', key: k, path } }
    }
    const desc = Object.getOwnPropertyDescriptor(obj, k)
    if (desc && (desc.get !== undefined || desc.set !== undefined)) {
      return {
        ok: false,
        error: { kind: 'prototype_pollution_attempt', key: `accessor:${k}`, path: `${path}.${k}` },
      }
    }
    const r = scanForPollution(obj[k], `${path}.${k}`)
    if (!r.ok) return r
  }

  return { ok: true, value: true }
}
