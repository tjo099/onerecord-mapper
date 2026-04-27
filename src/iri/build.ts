// src/iri/build.ts
import { defaultIriStrategy } from './default-strategy.js'
import type { ClassName, IriParts, IriStrategy, SafeIri } from './strategy.js'

/**
 * Generic IRI builder. Replaces the 32 per-class builders from spec v2 with
 * a single dispatcher per spec §13. Strategy injection enables consumer-side
 * IRI policy without coupling the mapper to a tenancy model.
 */
export function buildIri(
  className: ClassName,
  parts: IriParts,
  strategy: IriStrategy = defaultIriStrategy,
): SafeIri {
  return strategy.build(className, parts)
}
