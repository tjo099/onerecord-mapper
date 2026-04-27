// src/iri/default-strategy.ts
import type { ClassName, IriParts, IriStrategy, SafeIri } from './strategy.js'
import { validateIri } from './validate.js'

/**
 * Default IRI strategy per spec §2.1: `{host}/{tenant}/{className-lowercase}/{uuid}`,
 * https-only scheme allowlist. Output is validated through `validateIri` before
 * return so consumer code never sees a malformed or scheme-disallowed IRI.
 */
export const defaultIriStrategy: IriStrategy = Object.freeze({
  allowedSchemes: ['https'] as const,
  build(className: ClassName, parts: IriParts): SafeIri {
    if (!parts.host) {
      const e = new Error(
        `defaultIriStrategy.build: parts.host is required (received tenant=${parts.tenant})`,
      ) as Error & { code: string; details: unknown }
      e.code = 'iri_construction_failed'
      e.details = { parts, className }
      throw e
    }
    const raw = `https://${parts.host}/${parts.tenant}/${className.toLowerCase()}/${parts.uuid}`
    const r = validateIri(raw, { allowedSchemes: ['https'] })
    if (!r.ok) {
      const e = new Error(
        `defaultIriStrategy.build: produced invalid IRI ${raw} (${r.error.kind})`,
      ) as Error & { code: string; details: unknown }
      e.code = 'iri_construction_failed'
      e.details = { raw, error: r.error }
      throw e
    }
    return r.value
  },
})
