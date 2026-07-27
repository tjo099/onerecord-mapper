# Migrating between versions

This file documents one entry per minor release.

## Migrating from v0.4.x to v0.5.0

Existing cargo-model imports require no changes. v0.5.0 adds a stricter,
separate API wire boundary:

```ts
import {
  OneRecordServerInformationSchema,
  OneRecordPeerProfileSchema,
  assertEndorsedServerInformation,
} from '@flaks/onerecord/api'
```

Use these schemas at HTTP and Flaks Connect boundaries. Do not substitute the
older cargo-model `ServerInformationSchema` for API 2.2.0 wire validation; it
is retained for compatibility with existing application-layer mappings.

The peer profile contains discovery metadata, not credentials. A Connect
credential bundle may carry this profile, but each application must still
authenticate, authorize, and communicate using standard ONE Record endpoints
when the peer is not part of the Flaks sphere.

## Migrating from v0.3.x to v0.4.0

**No action required.** v0.4.0 is purely additive: it introduces the ULD
composition model (`UnitComposition`, `Composing`, `LoadingMaterial`, the
`CompositionType` code list, and the `ULD.inUnitComposition` back-reference).

- No classes removed, no fields renamed, no schema shapes changed.
- Existing v0.3.x wire payloads validate and round-trip unchanged.
- Adopt the new classes only if you produce or consume ULD-build records;
  otherwise upgrading is transparent.

Per the SemVer policy below, this minor bump carries no breaking changes
(it could have, but does not). Every modelling deviation in the new classes
is non-breaking and documented in `docs/spec-deviations.md` §17.

## Migrating from v0.2.x to v0.3.0

v0.3.0 is a **breaking release**. Review every item below before upgrading.

### 1. `Organization` class retired → use `Company`

`Organization` is removed. Import and use `Company` instead. Update all
references to `OrganizationSchema`, `OrganizationCodec`, `serializeOrganization`,
`deserializeOrganization`.

```typescript
// Before (v0.2.x)
import { OrganizationCodec } from '@flaks/onerecord'
// After (v0.3.0)
import { CompanyCodec } from '@flaks/onerecord'
```

### 2. `Waybill.shipmentInformation` → `Waybill.shipment`

```typescript
// Before
waybill.shipmentInformation = 'https://example/sh'
// After
waybill.shipment = 'https://example/sh'
```

### 3. `Shipment.containedPieces` → `Shipment.pieces`

```typescript
// Before
shipment.containedPieces = ['https://example/p1']
// After
shipment.pieces = ['https://example/p1']
```

### 4. `Shipment.shipper` / `Shipment.consignee` → `Shipment.involvedParties`

The `shipper` and `consignee` top-level fields on `Shipment` are removed.
Use `Shipment.involvedParties` filtered by `partyRole`:

```typescript
const shipper = shipment.involvedParties?.find(p => p.partyRole === 'SHP')
const consignee = shipment.involvedParties?.find(p => p.partyRole === 'CNE')
```

### 5. `Shipment.pieceCount` / `Shipment.totalVolume` removed

No direct replacement in v0.3.0. Compute `pieceCount` from `pieces.length`
if needed. `totalVolume` is deferred (no spec-correct successor in scope).

### 6. `AccountNumber` field renames

| v0.2.x field | v0.3.0 field | Notes |
|---|---|---|
| `accountNumber` | `textualValue` | String value of the account number |
| `accountType` | `accountNumberType` | IRI ref to code value |
| `issuedBy` | removed | Wrong domain; belongs to `:SecurityDeclaration` |

### 7. `Party.partyDetails` widening — additive for accept

`partyDetails` now accepts `Person | Company` (not `Person | Organization`).
**This is additive for deserializing**: a bare IRI still validates. Code
that checks `partyDetails['@type'] === 'Organization'` must be updated to
`'Company'`. The new `NI` value is accepted for `partyRole`.

### 8. `waybillNumber` and `waybillPrefix` regex relaxation

- **`waybillNumber`**: now accepts `[A-Z0-9]+` **per the 3.2-rc2 ontology
  pattern**. Do not assume numeric-only (`[0-9]+`) downstream.
- **`waybillPrefix`**: now accepts up to 3 alphanumeric characters (`[A-Z0-9]{1,3}`)
  as the library's **EDITORIAL policy** — the ontology only specifies
  `xsd:string maxLength 3` with no character-class restriction. Do not assume
  numeric-only downstream.

### 9. `CARGO_ONTOLOGY_VERSION` constant changed

The exported constant changed from `'3.2'` to `'3.2.0'`:

```typescript
// Before: CARGO_ONTOLOGY_VERSION === '3.2'
// After:  CARGO_ONTOLOGY_VERSION === '3.2.0'
```

Any code doing `=== '3.2'` on the constant must be updated to `=== '3.2.0'`
(or use `CARGO_ONTOLOGY_VERSION` indirectly).

### 10. `assertOntologyVersion` + `checkServerInformation` — exact-alias peer-compat policy

Both functions now use an **exact-alias accepted set**: `{'3.2.0', '3.2'}`.

- `assertOntologyVersion('3.2.0')` — does NOT throw (canonical pin)
- `assertOntologyVersion('3.2')` — does NOT throw (legacy alias ≡ 3.2.0)
- `assertOntologyVersion('3.2.1')` — THROWS `incompatible_ontology_version`
- `assertOntologyVersion('4.0')` — THROWS `incompatible_ontology_version`

The accepted set is **NOT** prefix-tolerant (`'3.2.1'` is master-only and
intentionally rejected). `checkServerInformation` follows the same rule:
a server advertising `cargoOntologyVersion: '3.2.1'` will return
`compatible: false`.

### 11. `waybillType` enum: `DIRECT` added

If your code has an exhaustive `switch` on `waybillType`, add a `'DIRECT'`
case. TypeScript will surface this at compile time.

### 12. `domain_constraint_violation` for stale fields no longer fires

If your code expected `domain_constraint_violation` for a Waybill missing
`shipmentInformation` or a Shipment missing `containedPieces`, those errors
no longer fire — those fields don't exist in v0.3.0. Update your error
handling to match the new field names (`shipment`, `pieces`).

---

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
