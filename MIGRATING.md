# Migrating between versions

This file documents one entry per minor release.

## Migrating from v0.1.x to v0.2.0

v0.2.0 is **non-breaking at the call-site level** for v0.1.x consumers.
Existing imports, codecs, and `createMapper({ ... })` calls work
unchanged. The release adds opt-in surfaces and one deprecation.

### What's new (additive — adopt if useful)

- **Graph-walk dispatcher** for cross-node integrity validation:
  ```typescript
  // Option A — namespaced facade
  import { onerecord } from '@flaks/onerecord'
  const r = onerecord.dispatch.deserialize.Waybill(input)

  // Option B — bound mapper
  import { createMapper } from '@flaks/onerecord'
  const m = createMapper({ graphWalk: true })
  const r = m.deserializeWaybill(input)
  ```
  Both emit `duplicate_id_in_graph`, `missing_id`, `wrong_type_for_endpoint`,
  `missing_type` for cross-node violations on direct children of the
  root. Default per-class deserializers (`WaybillCodec.deserialize`,
  `onerecord.deserialize.Waybill`) are unchanged — graph-walk is opt-in.

- **`acceptBookingOptionViaRequest`** — spec §5.4-correct booking flow
  that returns the `BookingOptionRequest` intermediate state instead
  of jumping straight to `Booking`:
  ```typescript
  import { acceptBookingOptionViaRequest } from '@flaks/onerecord'
  const result = acceptBookingOptionViaRequest(opt)
  // result.value is BookingOptionRequest, not Booking
  ```

### Deprecations (warn now, remove in v0.3)

- **`acceptBookingOption`** is `@deprecated`. Migrate to
  `acceptBookingOptionViaRequest` and chain through your persistence
  layer's BookingOptionRequest → Booking transition. Removal in v0.3
  unless an IATA §5.4 spec amendment restores the §5.2 shortcut.
  TypeScript will surface the deprecation; runtime behavior is unchanged
  through v0.2.x.

### FSU code list — 6 codes changed in each direction

The `FSU_EVENT_CODES` const + `test/fixtures/iata/xfsu-status-codes.json`
were regenerated from the upstream IATA-Cargo working draft. Net count
unchanged at 26, but **6 codes were dropped and 6 were added**:

- Removed: CLR, FOO, FWB, OFD, RCM, RCV
- Added:   DOC, DPU, FIW, FOW, OCI, OSI

If your application enumerates FSU codes directly via `FsuCode` or
`FSU_EVENT_CODES.<KEY>`, switch to the new keys. Audit before updating;
this is the only behavior change that may break consumer code.

### Bun-style consumers using `ignoreScripts`

If your consumer project sets `bun install --ignoreScripts` or equivalent,
v0.2.0 is unaffected — the library has no `prepare`/`postinstall` scripts.
The `xlsx` devDep (which carried two high-severity advisories) was
extracted to the sibling [`tjo099/onerecord-xlsx-tools`](https://github.com/tjo099/onerecord-xlsx-tools)
repo in v0.2.0. Your `bun audit` against `@flaks/onerecord` should now
show 0 findings from `xlsx` — only 2 vitest-transitive moderates remain.

## Migrating to v0.1.0

v0.1.0 is the first minor release. There is no prior version to migrate from.

### Install (current — v0.1.2 onwards)

```bash
npm install @flaks/onerecord
# or
bun add @flaks/onerecord
```

Pin a minor range in production (e.g. `"@flaks/onerecord": "^0.1.0"`).

### Older install paths (historical)

- `v0.1.0` shipped as a git-URL install only. Do not use — `dist/` was
  not in the tag. See CHANGELOG for details.
- `v0.1.1` attempted a `prepare`-script fix for git-URL installs.
  Does not work on Bun's default "trusted dependencies" model. Skipped
  in favor of v0.1.2 npm publish.

### Recommended import patterns

Standard imports:

```typescript
import { WaybillCodec, createMapper } from '@flaks/onerecord'
```

Tree-shake-optimized:

```typescript
import { WaybillCodec } from '@flaks/onerecord/codecs'
```

Type-only (zero runtime):

```typescript
import type { Waybill, ParseError } from '@flaks/onerecord/types'
```

### v0.x → v0.x+1 stability

Per `MIGRATING.md` policy: minor versions (0.1.x → 0.2.x) MAY introduce
breaking changes documented in the CHANGELOG; patch versions (0.1.0 → 0.1.x)
WILL NOT. Pin to a specific minor in CI.
