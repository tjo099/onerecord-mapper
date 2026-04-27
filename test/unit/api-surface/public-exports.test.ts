// test/unit/api-surface/public-exports.test.ts
import { describe, expect, it } from 'vitest'
import * as flaks from '../../../src/index.js'

/**
 * v3 (A1-R2-m3): replace v2's hand-written REQUIRED_EXPORTS literal with a
 * snapshot derived from `Object.keys(flaks)`. PR diffs surface intent
 * additions/removals — `git blame` shows whether a removed export was an
 * intentional API change. Hand-written list inevitably drifted.
 */
describe('public-exports (v3 — snapshot)', () => {
  it('every named export is reachable; surface is locked via snapshot', async () => {
    const surface = `${Object.keys(flaks).sort().join('\n')}\n`
    await expect(surface).toMatchFileSnapshot('./public-exports.snapshot.txt')
  })

  it('every snapshotted symbol is defined at runtime', () => {
    const undef: string[] = []
    for (const name of Object.keys(flaks)) {
      if ((flaks as Record<string, unknown>)[name] === undefined) undef.push(name)
    }
    expect(undef).toHaveLength(0)
  })
})
