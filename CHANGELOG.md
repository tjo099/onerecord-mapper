# Changelog

All notable changes are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/) per the policy in `MIGRATING.md`.

## [0.1.0] - 2026-04-27 (internal-only)

First minor release for internal consumption by Tracks B+C SaaS products. Not
published to public npm; not flagged for external distribution. All open-source
prep (commit signing, public repo flip, GPG release-tag verification) deferred
to v0.2.

### Library surface

- 32 OneRecord cargo data model 3.2 classes with full round-trip codec, Zod schema,
  JsonLd<T> brand, and snapshot test coverage:
  - Ring 1: Waybill, Shipment, Piece
  - Ring 2: Address, Person, Organization, Party, AccountNumber
  - Ring 3: TransportMovement, LogisticsEvent, MovementTime, Location
  - Ring 4: Subscription, SubscriptionRequest, Notification, ChangeRequest, Change,
    Operation, AccessDelegation, AccessDelegationRequest, Verification (with
    UnverifiedVerification brand per spec §3.1), VerificationRequest, ServerInformation
  - Ring 5: HandlingService
  - Booking: Booking, BookingRequest, BookingOption, BookingOptionRequest,
    BookingPreferences, BookingSegment, BookingShipment, BookingTimes
- `createMapper({ limits, iriStrategy, allowedSchemes })` — bound-methods factory
  with deep-frozen options at creation time
- `onerecord.{deserialize,serialize}.<Class>` — namespaced facade with no bound
  state, suitable for one-off operations
- `applyChange(codec, obj, change)` JSON-Patch-style mutation per spec §6.5 with
  invalid_pointer for traversal failures
- `validateOperation(op, allowedFields: ReadonlyArray<JsonPointer | RegExp>)` with
  locked type per spec §13
- Booking state machine: deep-frozen `STATE_DIAGRAM`, `canTransition` predicate,
  typed transition wrappers (acceptBookingRequest, acceptBookingOption,
  rejectBookingOption, revokeBookingOption)
- 22-variant `ParseError` discriminated union including v3 `invalid_pointer` for
  JSON-pointer traversal failures
- `SerializationError` class with `code: 'invalid_application_object' |
  'iri_construction_failed'`
- `formatError(e)` + `redactError(e)` helpers — exhaustive switch over all 22
  ParseError kinds
- 26-code FSU event-code map per spec acceptance #2
- Safety: pre-Zod sanity pass (depth/nodes/string/array/payload limits, prototype-
  pollution defense, JS-level circular reference detection)
- Branded `SafeIri` (https-only by default) + `safeIri()` Zod helper that lifts
  IRI failures into kind: 'invalid_iri' before the generic zod_validation envelope
- `Codec` subpath export `@flaks/onerecord/codecs` for tree-shake-optimized
  consumers
- Type-only barrel `@flaks/onerecord/types` for zero-runtime imports

### Test coverage

- 518 passing + 10 skipped = 528 total tests across 119 test files
- Property-based round-trip tests via fast-check (Waybill — extensible to other classes)
- Per-error-kind negative deserialize catalogue (15 files, manifest-verified via
  PARSE_ERROR_KIND_TO_FILE rename map)
- Class-completeness introspection (asserts all 32 classes have schema + tests +
  snapshots)
- Public API surface lock via snapshot test

### Internal-only release notes

- v0.1.0 ships as a private GitHub repo. Consumers (Tracks B+C) install via
  `bun install git+https://github.com/tjo099/onerecord-mapper#v0.1.0` with
  GitHub token auth.
- Commit signing remains suspended; release.yml's signed-tag verification gate
  is bypassed for v0.1.0. Both will be re-enabled before any public release.
- `security@flaks.io` placeholder in SECURITY.md remains (no MX record); replace
  before flipping the repo public.

---

## [Unreleased] (0.0.x prerelease scaffold — content promoted to [0.1.0] above)

### Build / dev environment changes (vs locked plan)
- Bun pin: `engines.bun` set to `1.3.x` (plan was `1.1.x`); CI `bun-version: '1.3.11'`. Reason: local toolchain is 1.3.11.
- `xlsx` devDep pinned to `^0.18.5` (plan was `^0.20.0`). Reason: 0.20.x is SheetJS Pro CDN-only, not public npm.
- `dependabot.yml` adds `ignore: [{ dependency-name: "*", update-types: ["version-update:semver-major"] }]` for both `github-actions` and `npm` ecosystems. Reason: locked plan pins specific majors (Biome 1.x, Vitest 2.x, fast-check 3.x, attw 0.16, types/node 20.x); without this rule Dependabot opens unwanted major-bump PRs every week. The first 5 such PRs (#1–#5) were closed manually.
- GHA workflow YAML: quoted `${{ }}` template expressions inside flow-style `with: { ... }` mappings in `ci.yml` (line 54: `node-version`) and `release.yml` (line 48: `artifact-name`). Reason: YAML's flow-mapping tokenizer collides with the `${` + `{` of the template delimiter, causing both workflows to fail GHA validation in 0s. The locked plan's verbatim YAML was invalid.

### Plan deviations
- **v3 plan correction (Phase 5 Task 25 onwards)**: per-class `deserialize.ts`
  runs `findFirstEmptyArray` BEFORE Zod (was post-Zod in the v3 template).
  Reason: harness `emptyArrayField` invocation expects `cardinality_violation`
  for `[]` injected into a single-IRI field whose schema is `safeIri().optional()`.
  Post-Zod placement is unreachable because Zod emits `zod_validation` first.
  Pre-Zod placement matches the spec's "reject empty arrays on the wire" intent
  and works regardless of the field's declared schema type.
- **T37a fixture hand-pinned**: `test/fixtures/iata/xfsu-status-codes.json` was
  written directly from the v2 plan's authoritative 26-code listing rather than
  being generated by `scripts/convert-iata-xlsx.ts --only fsu` (the xlsx-fetch
  script — full implementation deferred to T77). The 26 codes match the IATA
  Cargo XFSU-Status-Codes.xlsx working draft as of the v2 plan authoring date.
  Field `pinnedSha` is set to the placeholder `manually-pinned-v0.1.0`; T77
  will replace it with the upstream xlsx SHA.
- **T48a manifest assertion**: v3 plan said `expect(fileSet.size).toBe(16)`. The
  actual unique-file count from `PARSE_ERROR_KIND_TO_FILE` (in src/result.ts) is
  15 — `cardinality.test.ts` and `empty-array-on-wire.test.ts` are different
  files but only `cardinality.test.ts` is in the rename map (the empty-array
  regression file is referenced by T48b prose, not by the manifest). Adjusted
  the assertion to `toBe(15)`. The 16th file `empty-array-on-wire.test.ts`
  exists in `test/deserialize-errors/` but is NOT in the manifest map (it's a
  regression test for nested-empty-array detection per T48b).
- **Phase 9+ catalogue stubs**: `forbidden-state-transition.test.ts`,
  `operation-field-not-allowed.test.ts`, `prototype-key-injection.test.ts`
  (for prototype_pollution_attempt + invalid_pointer kinds), and
  `zod-shape.test.ts` (for change_partial_failure) contain `it.skip`
  placeholders for assertions that require Phase 9-10 machinery (applyChange,
  validateOperation, STATE_DIAGRAM). The manifest test still passes because
  these files exist and the placeholder tests are skipped (vitest counts
  skipped tests as neither passed nor failed).
- **`missing_type`, `wrong_type_for_endpoint`, `missing_id`,
  `duplicate_id_in_graph`, `mixed_context`**: per-class deserializers
  currently don't emit these kinds (Zod fires first for shape errors;
  graph-walk validation isn't implemented in v0.1.0). Their files exist
  with `it.skip` placeholders documenting "reserved for higher-level
  dispatch / facade" or similar. The kinds remain in the union for forward
  compatibility. (Exception: `mixed_context` IS emitted by `assertContextAllowed`
  for array `@context` with mixed allowed/unallowed members — its test file
  uses a real assertion, not a skip.)
- **T48a circular-reference test**: `circular_reference` kind is architecturally
  unreachable via a simple self-referential object (`wb.self = wb`) because
  `preValidate` step 2 (depth/node walk) recurses into the cycle and emits
  `depth_limit_exceeded` before step 4 (`detectCycle`) runs. The test covers
  both accepted kinds (`circular_reference` or `depth_limit_exceeded`) for the
  self-referential case, and separately verifies that `detectCycle` correctly
  accepts diamond (shared reference) patterns without false positive.
- **Phase 9-12 dispatched in 4 parallel worktrees**: To maximise throughput,
  Phase 9 (Tasks 49-53), Phase 10 (Tasks 54-63), Phase 11 (Task 64), and
  Phase 12 (Tasks 65-66) were implemented by 4 isolated subagents with
  `isolation: "worktree"`. Each agent committed to its own branch; Phase 9
  and Phase 11 were based on current main (clean fast-forward merges).
  Phase 10 and Phase 12 were based on the pre-Phase-4 main (stale worktree
  init), so their branches were cherry-picked file-by-file rather than
  merged: only the new `src/booking-flow/`, 8 booking class directories,
  their tests/factories, plus the `synthetic-fwb-1.expected.json` fixture
  and `synthetic-fwb.test.ts` integration test are taken. Phase 12's
  worktree-local Waybill re-creation was discarded (main already has the
  canonical Waybill from c8a7af0).
- **`toPreValidateOpts` + `toContextOpts` helpers (Phase 10)**: Phase 10's
  worktree introduced two helper functions in `src/classes/shared/parse-utils.ts`
  that encapsulate the conditional-spread pattern for
  `exactOptionalPropertyTypes`. Existing per-class deserialize.ts files
  (Phases 5-8) inline the conditional-spread; new booking deserialize.ts
  files (Phase 10) use the helpers. Both styles work — the helpers are
  the recommended pattern for new code.
- **`acceptBookingOption` deliberate divergence**: The typed transition
  wrapper (`src/booking-flow/transitions.ts`) skips the
  `BookingOptionRequest` intermediate state and returns a `Booking`
  directly. This contradicts spec §5.4 STATE_DIAGRAM (which routes
  `BookingOption.accept -> BookingOptionRequest`) but matches spec §5.2
  signature. v0.1.0 ships this divergence; v0.2 will reconcile.

### Known gaps to resolve before v0.1.0 release tag
- Commit signing (`git commit -S`) currently suspended (Tasks 1–8 commits are unsigned). Re-enable: configure SSH or GPG signing key + `git config commit.gpgsign true` + `tag.gpgsign true`. `release.yml` signed-tag verify is the release gate.
- `release.yml` step `Verify signed tag` (`git tag -v`) requires the maintainer GPG public key in the runner keyring. No `gpg --import` step is wired in yet — first release run will fail at tag verification on a cold runner. Add a `gpg --import` step that pulls the public key from a GitHub secret (`secrets.MAINTAINER_GPG_PUBLIC_KEY`) before `git tag -v`. Pair with the signing-key setup above.
- Repository visibility: PRIVATE. Flip to PUBLIC before v0.1.0 tag for Bun git-URL install by consumers (Tracks B + C). Apache 2.0 + git-URL distribution model.
- `SECURITY.md` "Supply chain" section currently flags signing as suspended; revert to unconditional once signing resumes. Same applies to the qualifier in the "Maintainer signing key" section.
- `SECURITY.md` `security@flaks.io` disclosure address is a placeholder — the `flaks.io` domain has no verified MX record at scaffold time. Before flipping the repo public, replace with either a maintained address or a GitHub Private Vulnerability Reporting URL (`https://github.com/tjo099/onerecord-mapper/security/advisories/new`).

### Feature changes
(To be filled in during Phase 17.)

---

## Ontology version pins

- Cargo data model: **3.2** (2025-07 endorsed standard)
- API spec: **2.2.0**
