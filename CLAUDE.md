# @flaks/onerecord Maintainer Notes

## What this repository brings to the platform

- This repository publishes the shared standards kernel
  `@flaks/onerecord`. It owns ONE Record cargo-model codecs, API 2.2 wire
  schemas, validation, JSON-LD safety limits, peer capability checks, typed
  protocol envelopes, and the transport-neutral ONE Record peer profile.
- It is intentionally **not** a broker, database, Flaks Connect client, or
  application workflow engine. Cargo ERP, Skidd, and Booking Portal own their
  persistence, authorization, business projections, and network behavior.
- Keep maintaining it. Shared standards parsing and validation here prevents
  four drifting interpretations across the applications, while keeping each
  application independently interoperable with standards-only peers.
- Flaks Connect may carry `OneRecordPeerProfile`, but the profile must remain
  usable outside Connect. Never add Flaks-specific credentials or lifecycle
  state to the ONE Record protocol schemas.

## Release 0.5.0 (2026-07-26/27)

- Version `0.5.0` adds the ONE Record API 2.2 interoperability boundary:
  ServerInformation endorsement checks; ChangeRequest,
  SubscriptionRequest, AccessDelegationRequest, and Notification schemas; and
  `OneRecordPeerProfileSchema`.
- The API surface is exported from `@flaks/onerecord/api` and the package root.
  The three application repositories pin this release exactly at `0.5.0`.
- Verification completed with 799 passing tests, one skipped contract test,
  green typecheck/lint/build, property tests, package inspection, and API
  surface validation.
- npm publishing now uses GitHub Actions trusted publishing in
  `.github/workflows/release.yml` for repository
  `tjo099/onerecord-mapper`. The workflow verifies a signed release tag, runs
  all release gates, creates the GitHub release, publishes only when the npm
  version is absent, and emits provenance. npm trust for
  `@flaks/onerecord` is scoped to `release.yml`.
- `@flaks/onerecord@0.5.0` is published. Immutable-version detection makes a
  manually retried workflow safe after a partial release.

## Release 0.6.0 (2026-11-13)

- Version `0.6.0` adds the ONE Record 3.2.0 Quote & Book charge chain:
  `Price`, `Ratings`, `TransportLegs`, nine embedded shapes, and
  `BookingOption` / `BookingRequest` / `Booking` realigned to the ontology.
  The 0.5.0 keys stay as optional and `@deprecated` (removal by 0.8.0,
  deviation #18). Every 0.5.0-valid payload still parses, which property
  tests check against the frozen oracle in `test/oracle/v0.5.0/`.
- The ontology pin stays 3.2.0. IATA's 3.2 and 3.3.0 ontology files are
  vendored in `test/fixtures/ontology/iata-onerecord/`, and
  `test/unit/ontology/quote-book-conformance.test.ts` checks the chain
  schemas against them. Update both when the pin moves.
- The three applications still pin `0.5.0`. Each moves to `0.6.0` only after
  it passes the adoption gate in `docs/ONE_RECORD_2_2_PROFILE.md`, and
  receivers upgrade first.
- Verification: 1502 passing tests, one skipped, 26 property tests, and green
  typecheck, lint, build, `api:check` and package inspection. Published by
  `release.yml` from the signed tag `v0.6.0`.
- 0.6.1 (2026-11-14) is a security patch: `zod ^4.6.6`
  (GHSA-mrhx-c7xc-m3w5), dev tooling refreshed, `@arethetypeswrong/cli`
  0.18.5. CI's `bun audit` gate fails on any advisory, including
  dev-only ones. When `main` has been quiet for a while, expect it to need a
  dependency refresh before the next release.
- Committed follow-ups:
  - 0.6.2 `flattenEmbeddedGraph`;
  - booking Path A (target 0.7.0): realign `BookingShipment`,
    `BookingSegment`, `BookingTimes`, `BookingPreferences` and the booking
    flow;
  - the 3.3.0 pin migration.

## Release discipline

- Keep `package.json`, `CHANGELOG.md`, the signed `vX.Y.Z` tag, and generated
  package contents aligned.
- Minor `0.x` releases may be breaking only when documented in
  `MIGRATING.md`; patch releases must remain compatible.
- Do not move application-specific persistence or Connect orchestration into
  this package. Add reusable wire contracts only when they are grounded in the
  IATA specification or the documented cross-application implementation
  profile.
