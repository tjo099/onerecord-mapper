export interface EquivOpts {
  /** Per-field-name precision class. Recurses into objects. */
  numericFields?: Record<string, 'monetary' | 'weight' | 'volume' | 'exact'>
}

type PrecisionClass = 'monetary' | 'weight' | 'volume' | 'exact'

const PRECISION_DP = { monetary: 2, weight: 3, volume: 4, exact: -1 } as const

function isEmptyArray(v: unknown): boolean {
  return Array.isArray(v) && v.length === 0
}

function isOmittable(v: unknown): boolean {
  return v === undefined || v === null || isEmptyArray(v)
}

function normIri(s: string): string {
  try {
    const u = new URL(s)
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href
  } catch {
    /* fallthrough */
  }
  return s.normalize('NFC')
}

// v3: accept offsetless form (e.g. 2026-01-01T00:00:00) as well as Z and +HH:MM
function looksLikeIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(s)
}

function looksLikeIri(s: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(s)
}

function numbersClose(a: number, b: number, klass: PrecisionClass): boolean {
  if (klass === 'exact') return Object.is(a, b)
  const dp = PRECISION_DP[klass]
  return Math.abs(a - b) < 0.5 * 10 ** -dp
}

function fieldEquivalentInner(
  a: unknown,
  b: unknown,
  opts: EquivOpts,
  fieldName: string | undefined,
  inheritedClass: PrecisionClass | undefined,
): boolean {
  if (Object.is(a, b)) return true
  if (isOmittable(a) && isOmittable(b)) return true

  if (typeof a === 'number' && typeof b === 'number') {
    const namedClass =
      fieldName !== undefined
        ? (opts.numericFields?.[fieldName] as PrecisionClass | undefined)
        : undefined
    const klass = namedClass ?? inheritedClass ?? 'exact'
    return numbersClose(a, b, klass)
  }

  if (typeof a === 'string' && typeof b === 'string') {
    if (looksLikeIso(a) && looksLikeIso(b)) {
      return new Date(a).getTime() === new Date(b).getTime()
    }
    if (looksLikeIri(a) || looksLikeIri(b)) {
      return normIri(a) === normIri(b)
    }
    return a === b
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!fieldEquivalentInner(a[i], b[i], opts, fieldName, inheritedClass)) return false
    }
    return true
  }

  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)])
    for (const k of keys) {
      const av = ao[k]
      const bv = bo[k]
      if (isOmittable(av) && isOmittable(bv)) continue
      // If this field has a named precision class, pass it as inherited to numeric children
      const childClass = (opts.numericFields?.[k] as PrecisionClass | undefined) ?? inheritedClass
      if (!fieldEquivalentInner(av, bv, opts, k, childClass)) return false
    }
    return true
  }

  return false
}

/**
 * Spec §7.1 round-trip tolerance:
 *  - missing / undefined / null / empty-array equivalent
 *  - property order irrelevant
 *  - HTTP IRIs normalized via URL.href; non-HTTP IRIs NFC-exact
 *  - numeric precision per opts.numericFields (monetary 2dp / weight 3dp / volume 4dp)
 *  - ISO datetimes UTC-normalized (v3: offset optional)
 */
export function fieldEquivalent(
  a: unknown,
  b: unknown,
  opts: EquivOpts = {},
  fieldName?: string,
): boolean {
  return fieldEquivalentInner(a, b, opts, fieldName, undefined)
}
