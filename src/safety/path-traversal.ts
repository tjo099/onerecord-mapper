// src/safety/path-traversal.ts
import type { ParseResult } from '../result.js'
import { isForbiddenKey } from './prototype-pollution.js'

export function unescapeJsonPointerSegment(seg: string): string {
  return seg.replace(/~1/g, '/').replace(/~0/g, '~')
}

export function isSafePathSegment(segment: string): boolean {
  return !isForbiddenKey(segment)
}

/**
 * v2 (A3-M3): canonical non-negative-integer test for array indices.
 * Accepts only `0`, `1`, ... `999...` — rejects negative, decimal, scientific
 * notation, leading-zero, whitespace, NaN, Infinity, hex.
 */
export function isValidArrayIndex(segment: string): boolean {
  if (segment === '' || segment.length > 10) return false
  if (segment === '0') return true
  // Canonical form: first char is 1-9, rest are 0-9
  if (!/^[1-9][0-9]*$/.test(segment)) return false
  const n = Number(segment)
  return Number.isInteger(n) && n >= 0 && n < 2 ** 32
}

export function validatePathSegments(pointer: string): ParseResult<readonly string[]> {
  if (pointer === '') return { ok: true, value: [] }
  if (!pointer.startsWith('/')) {
    return {
      ok: false,
      error: { kind: 'prototype_pollution_attempt', key: pointer, path: pointer },
    }
  }
  const segments = pointer.slice(1).split('/').map(unescapeJsonPointerSegment)
  for (const seg of segments) {
    if (!isSafePathSegment(seg)) {
      return { ok: false, error: { kind: 'prototype_pollution_attempt', key: seg, path: pointer } }
    }
  }
  return { ok: true, value: segments }
}
