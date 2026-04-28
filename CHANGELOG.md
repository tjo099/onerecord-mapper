# Changelog

All notable changes are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/) per the policy in `MIGRATING.md`.

## [0.2.0] - 2026-04-28

First publicly verifiable release. Closes 3 of 5 v0.1.x spec
deviations; documents 6 newly-identified deviations as deferred to
v0.3 with explicit "what to do today" guidance for integrators.

### Added

- **`acceptBookingOptionViaRequest(opt)`** — spec §5.4-correct booking
  transition that returns the intermediate `BookingOptionRequest` state
  instead of jumping straight to `Booking`. Closes deviation #1
  partially (forwarder→carrier hop only; carrier-side acceptance flow
  is v0.3 work).
- **Graph-walk dispatcher** — opt-in cross-node integrity validation
  via `createMapper({ graphWalk: true })` or
  `onerecord.dispatch.deserialize.<Class>`. Emits all four reserved
  ParseError kinds: `duplicate_id_in_graph`, `missing_id`,
  `wrong_type_for_endpoint`, `missing_type`. Default per-class
  deserializers unchanged. Closes deviation #2 for JSON-LD structural
  integrity (domain-semantic checks remain deviation #6, deferred).
- **`walkGraph` helper** at `src/safety/walk-graph.ts` — visitor-pattern
  recursive walker shared by `preValidate` and `dispatchGraphWalk`.
  Single traversal, no double-walk overhead.
- **`FIELD_TYPES` map** at `src/dispatch/field-types.ts` — covers all
  32 cargo classes with field-to-expected-type mappings; polymorphic
  fields marked `'*'`.
- **Property-based round-trip tests** for the 7 remaining Ring 1+2
  classes (Shipment, Piece, Address, Person, Organization, Party,
  AccountNumber). Joins the existing Waybill test. Total runtime ~1.6s.
- **`PARSE_ERROR_KINDS.length === 22` lock test** — fails CI on
  unexpected union drift.
- **Contract test harness + 3 PoC tests** at `test/contract/` against
  the OLF-hosted reference NE:ONE Server. Includes Keycloak auth +
  defensive RDF-strict-mode wire-format adapter (envelope shape,
  ObjectProperty `@id` wrapping, xsd-typed literals, `@graph` response
  unwrap). Excluded from the default `bun run test`; run via
  `bun run test:contract` after starting the local NE:ONE stack.
- **`MAINTENANCE.md`** — release playbook + signing key info + npm
  credential policy + bus-factor note (R8 mitigation).
- **Five new spec deviations (#6–#10)** documented as deferred to v0.3:
  domain-semantic cross-node validation, IRI dereferenceability,
  blank-node rejection, IRI canonicalization, `@context` array-order.
- **Spec deviation #11** — STATE_DIAGRAM source-state keys do not
  match `BookingOption.optionStatus` enum; documents intentional
  hardcode in the four `*BookingOption` transitions.

### Changed

- **FSU code fixture regenerated** with a real `sha256:` blob hash
  (`f5f483a5...`) sourced from upstream IATA-Cargo via the new sibling
  [`tjo099/onerecord-xlsx-tools`](https://github.com/tjo099/onerecord-xlsx-tools)
  tool. v0.1.x's hand-pinned 26 codes diverged from the upstream working
  draft by 6 codes in each direction. Per Phase 0 verification the
  upstream set is adopted: removes CLR, FOO, FWB, OFD, RCM, RCV; adds
  DOC, DPU, FIW, FOW, OCI, OSI. `FSU_EVENT_CODES` const updated to
  match. Closes deviation #4.
- Spec rev-2 wording corrected: the reference NE:ONE Server is hosted
  by the **Open Logistics Foundation Working Group on Digital Air
  Cargo**, not IATA-Cargo. OLF License v1.3 — unrestricted CI use
  confirmed (R6 closure).

### Deprecated

- **`acceptBookingOption`** — marked `@deprecated`; removal in v0.3
  unless IATA §5.4 reconciliation restores the §5.2 shortcut. Migrate
  to `acceptBookingOptionViaRequest`.

### Removed

- **`xlsx` devDep** moved to the sibling
  [`tjo099/onerecord-xlsx-tools`](https://github.com/tjo099/onerecord-xlsx-tools)
  repo. Closes the two high-severity advisories on the main library's
  surface (Prototype Pollution + ReDoS). `bun audit` now shows 2
  remaining vitest-transitive moderates only.
- `scripts/convert-iata-xlsx.ts` — moved to the sibling repo.

### Fixed

- v0.1.2 GitHub Release page backfilled (the auto-create step in
  `release.yml` failed on the v0.1.2 publish before commit `d8acc2c`
  added the explicit `git fetch --tags --force` step).
- Re-enabled four `it.skip` placeholder tests in `test/deserialize-errors/`:
  `forbidden_state_transition`, `operation_field_not_allowed`,
  `prototype_pollution_attempt` + `invalid_pointer` (via `applyChange`),
  and `change_partial_failure`. Plus the four graph-walk-emitted kinds
  (`duplicate_id_in_graph`, `missing_id`, `missing_type`,
  `wrong_type_for_endpoint`) — formerly placeholders, now real
  assertions against `dispatchGraphWalk`.

### Plan deviations (v0.2.0 work that diverged from the original plan)

- **Phase 2 Task 2.1 reinterpreted (Path B)** — the plan proposed
  reading `canTransition` source state from `opt.optionStatus`. The
  Phase 2 readiness scan showed this would break every BookingOption
  transition because STATE_DIAGRAM source-state keys don't align with
  the schema's optionStatus enum. The hardcode is intentional pending
  v0.3 reconciliation; deviation #11 documents the underlying issue.
- **Phase 5 partial scope** — 3 of 6 contract test topics implemented
  (Waybill, Shipment, BookingRequest); Piece, Operations, Notification
  use the same harness pattern and are deferred to v0.3. CI integration
  (release.yml NE:ONE gate, nightly contract job) deferred — bundling
  the multi-service NE:ONE stack for headless GitHub Actions runners
  is non-trivial. Run manually before tagging.
- **Phase 1 Task 1.5 location** — sibling repo cloned to
  `F:/dev/onerecord-xlsx-tools/` (matching the maintainer's
  `F:/dev/` convention) instead of the plan's `/tmp/`.
- **Plan-vs-API drifts surfaced and corrected** — the plan's verbatim
  test code for Tasks 1.2/1.3/1.4 used an obsolete Operations API
  (`o`/`s`/`v` shorthand vs. real `op`/`path`/`value`;
  `Change.operations` vs. real `Change.hasOperation`; `add`/`replace`
  enum vs. real `ADD`/`DELETE`). Test bodies rewritten to match real
  schemas. Plan's `findContainingClass` always-returns-undefined logic
  bug fixed in `dispatchGraphWalk` (depth-1 wrong-type checks now fire).
- **Test paths normalized** — `test/api-surface/` and `test/dispatch/`
  in the plan's File Structure table actually live at
  `test/unit/api-surface/` and replaced existing placeholders in
  `test/deserialize-errors/`.

## [0.1.2] - 2026-04-27 (npm publish — supersedes 0.1.1)

`@flaks/onerecord` is now published to the public npm registry as a
scoped public package. **This is the first version Tracks B + C
should adopt.** v0.1.1's `prepare`-script approach to the git-URL
install issue does not work on Bun (default "trusted dependencies"
model blocks lifecycle scripts); v0.1.2 ships pre-built `dist/` in
the registry tarball, making `bun add @flaks/onerecord` work
zero-config across all package managers.

### Install

```bash
npm install @flaks/onerecord
# or
bun add @flaks/onerecord
# or
pnpm add @flaks/onerecord
```

### Why npm publish moved earlier than the v0.2.0 plan

The original v0.2.0 roadmap listed npm publish as one of several
ecosystem-hardening items (alongside NE:ONE contract test, SBOM/SLSA,
bundle-size assertion). After v0.1.0 + v0.1.1 git-URL distribution
attempts proved unworkable for Bun consumers, npm publish moved into
v0.1.2 as a hotfix. The remaining v0.2.0 items still apply.

### Release pipeline fix

- Add `fetch-tags: true` to the `actions/checkout` step in
  `release.yml`. Without this, the runner's git tag object is
  materialized as a lightweight ref (commit only, no signature
  metadata), and `git tag -v` fails with `cannot verify a non-tag
  object of type commit`. This is what caused the v0.1.1 release.yml
  run to fail.

### Package metadata

- Added `keywords`, `homepage`, `bugs`, `author` fields to
  `package.json` for npm registry display and search indexing.
- Changed `publishConfig.access` from `restricted` to `public`.

### Note on v0.1.1

v0.1.1 remains tagged in git but is documented broken — `prepare`
script alone does not work for Bun consumers. Do not pin to v0.1.1.
v0.1.2 is the version Tracks B + C should adopt.

## [0.1.1] - 2026-04-27 (install fix attempt — superseded by 0.1.2)

**Tagged but functionally broken on Bun consumers.** This release
attempted to fix the v0.1.0 git-URL install breakage by adding a
`prepare` lifecycle script. The fix worked for npm consumers (which
default-trust `prepare` for git installs) but failed on Bun, which
default-blocks postinstall scripts via its "trusted dependencies"
model. See `[0.1.2]` above for the actual fix (npm publish).

The CHANGELOG content originally drafted under this version (open-
sourcing pass items: GPG signing, governance scaffolding, public docs,
public flip) shipped to `main` with this tag and is preserved on the
v0.1.1 commit (`86dd181`). All of those items are also present in
v0.1.2.

Original v0.1.1 changelog content follows for historical reference:

### Critical install fix

- Add `prepare` lifecycle script to `package.json` so
  `bun add git+https://github.com/tjo099/onerecord-mapper#v0.1.1`
  builds `dist/` on install. v0.1.0 published `exports` pointing at
  `./dist/...` but had no `prepare` script and `dist/` is gitignored,
  so consumers got an unimportable package: "Cannot find module
  '@flaks/onerecord'". The `prepare` script runs
  `tsc -p tsconfig.build.json` at install time (Bun and npm both run
  `prepare` for git-URL packages by default).

  **Note for consumers with `ignore-scripts=true`** (security-hardened
  npm/bun config): `prepare` will not run automatically. Either
  temporarily allow scripts when installing this package, run
  `bun run build` manually inside `node_modules/@flaks/onerecord/`
  post-install, or wait for v0.2.0, which publishes `@flaks/onerecord`
  to npm with prebuilt `dist/` in the registry tarball (no `prepare`
  needed).

### Release pipeline corrections

- Remove the "Verify built dist matches committed dist" step from
  `release.yml`. It was incompatible with `.gitignore` excluding
  `dist/`; the gate would always fail on a real release run. Build
  artefact integrity is now provided by the `prepare` script on
  consumer machines and (in v0.2.0) by the npm registry tarball.
- Disable (comment) the NE:ONE contract gate step in `release.yml`.
  The `test/contract/docker-compose.neone.yml` file referenced by the
  step does not exist; the contract test was deferred to v0.2 Phase 14
  (Tasks 68-71). The step is restored when Phase 14 lands.

### Open-sourcing pass — completed

- Maintainer GPG signing key generated: `ed25519/55BABA8EED158AD1`
  (fingerprint `8033 2600 17B9 BAE5 BAD9 CA15 55BA BA8E ED15 8AD1`),
  UID `tjo099 <tjo099@gmail.com>`, expires 2028-04-26. Public key
  served at `https://github.com/tjo099.gpg`.
- Local git config: `commit.gpgsign=true`, `tag.gpgsign=true`,
  `user.signingkey` set globally. Signing verified end-to-end via
  `gpg --clearsign` and via signed commits landing on `main`.
- `MAINTAINER_GPG_PUBLIC_KEY` repository secret set on
  `tjo099/onerecord-mapper` with the ASCII-armored public key.
- `release.yml` imports the maintainer GPG public key from
  `secrets.MAINTAINER_GPG_PUBLIC_KEY` before the `git tag -v`
  verification gate. Closes the cold-runner failure mode flagged in
  v0.1.0 "Known gaps" item #2.
- `SECURITY.md`: GPG fingerprint placeholder filled with the real
  fingerprint and updated to point at `https://github.com/tjo099.gpg`
  as the canonical public-key source. Placeholder `security@flaks.io`
  (no MX record) replaced with GitHub Private Vulnerability Reporting
  URL. Closes v0.1.0 "Known gaps" item #5.
- Public-OSS hygiene scaffolding added: `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md` (adopts Contributor Covenant 2.1 by reference),
  `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}`,
  `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS`.
- README + MIGRATING rewritten for public consumers (drop "internal
  use only" framing, drop `GITHUB_TOKEN` requirement). Added "Why use
  this library?" section.
- New `docs/spec-deviations.md`: consumer-focused documentation of
  five deliberate divergences from canonical IATA OneRecord behavior
  in v0.1.x. Source of truth for deviations.
- Repository visibility flipped PRIVATE → PUBLIC. First signed commits
  landed on `main` and verified by GitHub.

### Carry-forward to v0.2.0

- npm publish workflow for `@flaks/onerecord` as a public scoped
  package — removes the `prepare`-script dependency on consumer
  toolchain and closes the `ignore-scripts=true` fragility.
- Maintainer must back up the auto-generated revocation certificate at
  `~/.gnupg/openpgp-revocs.d/8033260017B9BAE5BAD9CA1555BABA8EED158AD1.rev`
  to offline storage (user-action; not code-shippable).

## [0.2.0] - planned (open-sourcing pass + ecosystem hardening)

Internal consumption from Tracks B+C plus selective external publication. Goal:
make the mapper safe to flip the repo public and accept community contributions
without retroactive scrubbing.

### Open-sourcing prep

- Re-enable commit signing (GPG or SSH) — `git config commit.gpgsign true` +
  `tag.gpgsign true`. All v0.1.x commits remain unsigned; v0.2 commits will be
  signed.
- Wire `gpg --import` step into `release.yml` before the `git tag -v`
  verification gate. Public key sourced from `secrets.MAINTAINER_GPG_PUBLIC_KEY`.
- Replace `security@flaks.io` placeholder in `SECURITY.md` with either a
  maintained address or the GitHub Private Vulnerability Reporting URL.
- Flip GitHub repo from private to public.
- npm publish workflow (`@flaks/onerecord` scoped public) — alternative to
  git-URL distribution.

### Phase 14 — NE:ONE Docker contract test (deferred from v0.1)

- Tasks 68-71: docker-compose for NE:ONE Server reference impl, contract test
  against a running server (`bun run test:contract`), nightly CI job, release
  gate exercises the contract test before tagging.

### Ecosystem hardening

- Property-based round-trip tests extended beyond Waybill (Shipment, Piece,
  Address, Party, ...) — same pattern as `test/property/waybill-roundtrip.property.test.ts`.
- SBOM via `syft` + SLSA provenance docs (T70).
- Bundle-size assertion in `release.yml` — keeps tree-shake claims honest
  (T82 step 4b).

### API additions under consideration

- Graph-walk validation: emit `duplicate_id_in_graph`, `missing_id`,
  `wrong_type_for_endpoint`, `missing_type` from a higher-level dispatch
  layer (currently these kinds exist in the union but no per-class deserializer
  emits them).
- Reconcile `acceptBookingOption` divergence — either implement the
  spec §5.4 BookingOptionRequest intermediate, or formalize the v0.1
  shortcut with a spec amendment PR to IATA.
- Zod 4 migration if upstream stabilizes.

### Plan deviations from v3 spec to revisit

- Replace hand-pinned T37a fixture (`pinnedSha: manually-pinned-v0.1.0`) with
  a real upstream xlsx SHA via `scripts/convert-iata-xlsx.ts --only fsu`.
- Re-enable T48a Phase 9+ catalogue assertions: `forbidden-state-transition`,
  `operation-field-not-allowed`, `prototype-key-injection` (the applyChange
  variants), `change_partial_failure` in `zod-shape.test.ts`. Currently
  placeholder-skipped.

---

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
