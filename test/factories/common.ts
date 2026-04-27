import { randomUUID } from 'node:crypto'
import { defaultIriStrategy } from '../../src/iri/default-strategy.js'
import type { ClassName } from '../../src/iri/strategy.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

const TEST_HOST = 'test.flaks.example'
const TEST_TENANT = 'test-tenant'

export function testIri(className: ClassName, uuid: string = randomUUID()): string {
  return defaultIriStrategy.build(className, {
    tenant: TEST_TENANT,
    uuid,
    host: TEST_HOST,
  })
}

export function envelope(typeName: string, idHint?: string) {
  return {
    '@context': CARGO_CONTEXT_IRI,
    '@type': typeName,
    '@id': testIri(typeName, idHint),
  } as const
}

/**
 * Snapshot factory binder — pins @id and any time-derived field to deterministic
 * values so toMatchFileSnapshot diffs are stable. v2 (A2-M2): mandatory in every
 * snapshot test in Phases 5-11.
 *
 * Usage: const wb = snapshotFixtureFor('Waybill', createWaybill)
 */
export const SNAPSHOT_FIXED_DATE = '2026-01-01T00:00:00.000Z' as const

export function snapshotFixtureFor<T extends { '@id': string }>(
  className: string,
  factory: (overrides?: Partial<T>) => T,
): T {
  const baseIri = `https://snapshot.example/wf/${className.toLowerCase()}/fixed-id`
  const obj = factory({ '@id': baseIri } as Partial<T>)
  // Stamp every ISO-8601 looking field to SNAPSHOT_FIXED_DATE
  for (const k of Object.keys(obj)) {
    const v = (obj as Record<string, unknown>)[k]
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      ;(obj as Record<string, unknown>)[k] = SNAPSHOT_FIXED_DATE
    }
  }
  return obj
}
