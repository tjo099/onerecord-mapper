# Roadmap

This document tracks the trajectory of `@flaks/onerecord` from its
current state toward becoming the canonical reference TypeScript
implementation of IATA OneRecord cargo data model 3.2 + API spec
2.2.0. It is intended for the IATA-Cargo working group, OneRecord
reference-implementation maintainers, and integrators evaluating
when to adopt the library.

For currently-tagged releases see [`../CHANGELOG.md`](../CHANGELOG.md).
For known divergences from the canonical spec see
[`spec-deviations.md`](spec-deviations.md).

## Where we are now — v0.1.2

**Released 2026-04-27.** First usable public release. Live on npm as
`@flaks/onerecord@0.1.2`. Five documented spec deviations (see
`spec-deviations.md`); the library is functional and pin-installable
but the "reference implementation" claim is not yet defensible.

## v0.2.0 — First publicly verifiable release

**Status**: design spec at
[`specs/2026-04-27-v0.2.0-design.md`](specs/2026-04-27-v0.2.0-design.md),
revision 2. Estimated 9 weeks from kickoff.

v0.2.0 shifts the library from "internal use" to "anyone in the
cargo industry can verify our conformance claims against the IATA
reference implementation." Three of five documented deviations
close. An infrastructure layer (Docker-orchestrated NE:ONE Server
contract test, property-based round-trip testing for Ring 1+2,
re-enabled assertion catalogue) lets third parties run the
conformance evidence themselves.

### Closes

- **Deviation #1 (partial)** — `acceptBookingOptionViaRequest()`
  returns the spec-correct `BookingOptionRequest` intermediate.
  Forwarder→carrier transition only; carrier-side transitions
  (`acceptBookingOptionRequest`, `rejectBookingOptionRequest`,
  `confirmBooking`) shift to v0.3.
- **Deviation #2 (JSON-LD structural integrity)** — graph-walk
  validation emitting `duplicate_id_in_graph`, `missing_id`,
  `wrong_type_for_endpoint`, `missing_type`. Available via
  `createMapper({ graphWalk: true })` or
  `onerecord.dispatch.deserialize.<Class>`. Existing per-class
  deserializers unchanged. Domain-semantic cross-node validation
  becomes deviation #6, deferred to v0.3.
- **Deviation #4** — FSU code fixture derived from upstream IATA
  xlsx; drift detection via SHA256-of-blob; xlsx vulnerability
  removed from main lib (extracted to sibling `onerecord-xlsx-tools/`
  repo).

### Adds

- **NE:ONE Docker contract test suite** — orchestrates IATA's
  reference NE:ONE Server, exercises Ring 1 round-trip + booking
  flow + §6.5 Operations (JSON-Patch) + Notification flow.
- **Property-based round-trip testing** for Ring 1+2 (8 classes:
  Waybill, Shipment, Piece, Address, Person, Organization, Party,
  AccountNumber). Canonical-form equality per spec §7.1.
- **Re-enabled Phase 9+ assertion catalogue** — forbidden-state-
  transition, operation-field-not-allowed, prototype-pollution,
  change-partial-failure now have real assertions instead of
  `it.skip` placeholders.
- **Five additional deviations (#6-#10) documented** in
  `spec-deviations.md` to make remaining gaps to "reference
  implementation" status explicit and trackable.

### Non-breaking adoption

Consumers adopt v0.2.0 with zero call-site changes. The
`acceptBookingOption` shortcut is deprecated with v0.3 removal.

### Strategic positioning

After v0.2.0, the defensible claim is **"first publicly verifiable
TypeScript implementation of IATA OneRecord 3.2 + API 2.2.0."** It
is *not yet* "reference implementation" — that claim is reserved
for v0.3.0 once behavioral fidelity gaps close.

## v0.3.0 — Reference implementation candidate

**Status**: planning to begin after v0.2.0 ships. Target window TBD
based on v0.2.0 actuals. Estimated scope below is what would be
needed for a defensible "reference implementation" claim per
domain-expert review of the v0.2.0 design.

### Closes

- **Deviation #1 fully** — carrier-side booking transitions:
  `acceptBookingOptionRequest`, `rejectBookingOptionRequest`,
  `confirmBooking` per spec §5.4 STATE_DIAGRAM. Removal of the
  deprecated `acceptBookingOption(opt) → Booking` shortcut.
- **Deviation #6** — domain-semantic cross-node validation:
  AWB number consistency between Waybill and embedded Shipments,
  total-pieces / total-weight consistency, graph-level cardinality
  (Waybill MUST have exactly one Shipment, Shipment MUST have ≥1
  Piece), reference resolvability for IRIs that point inside
  vs outside the graph.
- **Deviation #7** — IRI dereferenceability checking beyond
  syntactic validation.
- **Deviation #8** — Blank-node (`_:b0`) rejection. OneRecord
  forbids blank nodes in the canonical wire form.
- **Deviation #9** — IRI canonicalization per RFC 3987 + spec
  §3.2 (percent-encoding normalization, lowercase scheme/host,
  no default-port).
- **Deviation #10** — `@context` array order resolution per
  JSON-LD 1.1 (later contexts override earlier ones).

### Adds

- **Property-based round-trip testing extended to all 32 classes**
  (Rings 3-5: TransportMovement, LogisticsEvent, MovementTime,
  Location; Subscription/Notification/Verification cluster;
  HandlingService; full Booking cluster).
- **Contract test coverage extended** to AccessDelegation
  (federated authorization handshake) and LogisticsEvent
  (operational event stream).
- **Comprehensive contract testing** — major API endpoint per
  class against NE:ONE Server.
- **Conformance matrix** — public document mapping every cited
  spec section to the test file that proves library compliance.
  This is the artifact the IATA-Cargo working group can audit.
- **Release pipeline maturation** — bundle-size assertion in
  `release.yml`, automated `npm publish`, comprehensive supply-
  chain hardening.

### Defensibility check

By the end of v0.3.0, the library has closed all currently-known
behavioral deviations from the canonical spec, ships verifiable
evidence for every cited spec section, and publishes a conformance
matrix. At that point, **"reference TypeScript implementation of
IATA OneRecord 3.2 + API 2.2.0"** becomes a defensible claim that
holds up to working-group scrutiny.

## v0.4.0+ — Beyond reference (aspirational)

Decisions to be made closer to the time. Candidates:

- **Zod 4 migration** if upstream stabilizes.
- **Performance optimization** — graph-walk dispatch is opt-in
  in v0.2-v0.3 due to perf budget; v0.4 may flip the default
  on if benchmarks justify.
- **Cargo-domain expansions** per IATA-Cargo working group
  feedback.
- **Federation patterns library** — helpers for common
  cross-organization OneRecord interactions (multi-party
  AccessDelegation chains, subscription fan-out, change-request
  reconciliation).
- **TypeScript declaration improvements** driven by consumer
  feedback from v0.2-v0.3.
- **Cargo iQ integration** — formal mappings between OneRecord
  events and the Cargo iQ Master Operating Plan milestone set.

## Engagement

Issues, deviation reports, contract-test results, and PRs welcome
via https://github.com/tjo099/onerecord-mapper/issues.

For coordination with the IATA-Cargo working group on spec
amendments, conformance interpretation, or working-draft updates,
the maintainer is reachable via:

- GitHub Private Vulnerability Reporting (for security-related
  spec issues): https://github.com/tjo099/onerecord-mapper/security/advisories/new
- Public discussion: GitHub repo Discussions (once enabled)
- Direct: see `SECURITY.md` for maintainer contact details

The library follows IATA's reference repository at
https://github.com/IATA-Cargo/ONE-Record as canonical for spec
text and ontology versioning.
