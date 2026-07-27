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

## Release discipline

- Keep `package.json`, `CHANGELOG.md`, the signed `vX.Y.Z` tag, and generated
  package contents aligned.
- Minor `0.x` releases may be breaking only when documented in
  `MIGRATING.md`; patch releases must remain compatible.
- Do not move application-specific persistence or Connect orchestration into
  this package. Add reusable wire contracts only when they are grounded in the
  IATA specification or the documented cross-application implementation
  profile.
