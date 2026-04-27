// test/snapshots/classes/_harness.ts
//
// Parameterised snapshot harness — registers the deterministic snapshot test
// for every per-class snapshot file.

import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { snapshotFixtureFor } from '../../factories/common.js'

export interface SnapshotHarnessOpts<App extends { '@id': string }, Wire> {
  readonly className: string
  readonly schema: z.ZodType<App>
  readonly serialize: (input: App) => Wire
  readonly factory: (overrides?: Partial<App>) => App
}

export function snapshotHarness<App extends { '@id': string }, Wire>(
  opts: SnapshotHarnessOpts<App, Wire>,
): void {
  const { className, schema, serialize, factory } = opts

  describe(`${className} snapshot`, () => {
    it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
      const obj = schema.parse(snapshotFixtureFor(className, factory))
      const out = serialize(obj)
      const file = `./${className.toLowerCase()}.snapshot.json`
      await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(file)
    })
  })
}
