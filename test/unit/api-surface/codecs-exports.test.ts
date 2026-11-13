// test/unit/api-surface/codecs-exports.test.ts
import { describe, expect, it } from 'vitest'
import * as codecs from '../../../src/codecs.js'

/**
 * Runtime-key snapshot for the `./codecs` subpath export. Mirrors
 * `public-exports.test.ts`: PR diffs surface intentional additions/removals.
 */
describe('codecs-exports (snapshot)', () => {
  it('every named export is reachable; surface is locked via snapshot', async () => {
    const surface = `${Object.keys(codecs).sort().join('\n')}\n`
    await expect(surface).toMatchFileSnapshot('./codecs-exports.snapshot.txt')
  })

  it('every snapshotted symbol is defined at runtime', () => {
    const undef: string[] = []
    for (const name of Object.keys(codecs)) {
      if ((codecs as Record<string, unknown>)[name] === undefined) undef.push(name)
    }
    expect(undef).toHaveLength(0)
  })
})
