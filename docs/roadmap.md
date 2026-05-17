# Roadmap

This document tracks the trajectory of `@flaks/onerecord` from its
current state toward becoming the canonical reference TypeScript
implementation of IATA OneRecord cargo data model 3.2.0 + API spec
2.2.0. It is intended for the IATA-Cargo working group, OneRecord
reference-implementation maintainers, and integrators evaluating
when to adopt the library.

For currently-tagged releases see [`../CHANGELOG.md`](../CHANGELOG.md).
For the v0.3.0 breaking-change upgrade path see
[`../MIGRATING.md`](../MIGRATING.md). For known divergences from the
canonical spec see [`spec-deviations.md`](spec-deviations.md), and for
the field-by-field 3.2.0 mapping see
[`conformance-matrix.md`](conformance-matrix.md).

## Where we are now — v0.3.0 (released 2026-05-17)

Tagged `v0.3.0` and published to npm as `@flaks/onerecord@0.3.0`.

v0.3.0 is the **FWB-equivalence** release: a coordinated breaking
correction ("Path A") plus a cargo-domain expansion focused on
(X)FWB / Air-Waybill reconstruction. It is a demand-driven
cargo-coverage and spec-correctness release — **not** the
"reference implementation" milestone the earlier roadmap had
reserved for v0.3.0. That deviation-closure programme remains open
(see "Still ahead" below); v0.3.0 deliberately did not bundle it.

**Delivered:**

- Eight new (X)FWB / Air-Waybill classes — `Company` (the spec
  successor that retires the non-spec `Organization`),
  `WaybillLineItem`, `OtherCharge`, `CustomsInformation`,
  `Insurance`, `LineItemPackage`, `ULD`, `CO2Emissions` — plus
  `RegulatedEntity` and `SecurityDeclaration`, plus spec-correct
  shared value sub-schemas (`Value` / `CurrencyValue` /
  `Dimensions` / `OtherIdentifier`).
- Path-A spec corrections to the FWB spine as **coordinated
  breaking changes**: `Shipment` / `Waybill` / `Piece` / `Party` /
  `AccountNumber` keys aligned to OneRecord 3.2.0; `Organization`
  retired in favour of `Company`.
- Ontology pin moved to **3.2.0** (`CARGO_ONTOLOGY_VERSION`), with
  an exact-alias peer-compat policy: `'3.2'` ≡ `'3.2.0'` accepted,
  the unreleased-master `'3.2.1'` rejected.
- A public **conformance matrix** mapping every covered class and
  corrected field to its binding 3.2.0 ontology authority and the
  test that proves it — the artifact the IATA-Cargo working group
  can audit.
- Four documented deviations (#12, #14, #15, #16) recording the
  intentional, non-silent gaps to strict 3.2.0.

**Honest positioning.** v0.3.0 is
**"3.2.0-conformant for the covered class set, with documented
deviations and 3.2.1-forward extensions"** — e.g.
`Shipment.securityDeclarations` is accepted as a documented
3.2.1-forward extension (deviation #12). It is a breaking upgrade
from v0.2.x; every consumer-visible break is enumerated in
`CHANGELOG.md`'s `### BREAKING CHANGES`, with the old→new mapping in
`MIGRATING.md`. The `partyDetails` widening and the ontology-version
alias were deliberately designed to be non-breaking-for-accept to
soften the upgrade.

## Released history

### v0.1.2 — first usable public release (2026-04-27)

First pin-installable public release. Five documented spec
deviations; the "reference implementation" claim was explicitly
not yet defensible.

### v0.2.0 — first publicly verifiable release

Shifted the library from "internal use" to "third parties can
verify our conformance claims against the IATA reference
implementation": Docker-orchestrated NE:ONE Server contract suite,
property-based round-trip testing for Ring 1+2, a re-enabled
assertion catalogue. Closed deviations #1 (partial — forwarder→
carrier transition), #2 (JSON-LD structural-integrity graph-walk),
and #4 (FSU fixture drift detection; xlsx vulnerability extracted to
the sibling `onerecord-xlsx-tools/` repo); documented deviations
#6–#10. Non-breaking adoption. The defensible claim after v0.2.0
was *"first publicly verifiable TypeScript implementation of IATA
OneRecord 3.2 + API 2.2.0"* — not yet "reference implementation".

## Still ahead — reference-implementation programme

The deviation-closure work the earlier roadmap scoped under v0.3.0
did **not** ship in the FWB-equivalence v0.3.0 and remains open, to
be scheduled in subsequent releases (no fixed completion target;
demand-driven):

- **Deviation #1 (fully)** — carrier-side booking transitions
  (`acceptBookingOptionRequest`, `rejectBookingOptionRequest`,
  `confirmBooking` per spec §5.4 STATE_DIAGRAM) and removal of the
  deprecated `acceptBookingOption(opt) → Booking` shortcut. This is
  the blocked booking-flow "Phase 3" — file-disjoint from and
  intentionally excluded from FWB-equivalence.
- **Deviation #6** — domain-semantic cross-node validation. v0.3.0
  *removed* the stale v0.2 graph-cardinality constraints that Path A
  invalidated (the old "Waybill MUST have shipmentInformation" /
  "Shipment MUST have pieceCount" had no 3.2.0 basis post-Path-A);
  the spec-correct Waybill↔Shipment inverse-property consistency
  check is a named follow-up (it needs multi-node resolution the
  current constraint framework does not yet support — recorded, not
  silent).
- **Deviations #7 / #8 / #9 / #10** — IRI dereferenceability,
  blank-node rejection, RFC-3987 IRI canonicalization, and
  `@context` array-order resolution. Unchanged by v0.3.0; still
  open.
- **Named follow-up batches from v0.3.0's deviations** — modelling
  `:BillingDetails` (deviation #16) and the non-deprecated
  `accountingNotes` / `:AccountingNote` path (deviation #15);
  retrofitting the legacy `{unit,value}` / `{l,w,h}` value-object
  shape on the three pre-existing fields `Shipment.totalGrossWeight`
  / `Piece.grossWeight` / `Piece.dimensions` to the spec-correct
  `:Value` / `:Dimensions` schemas (deviation #14, a deliberately
  separate batch so Path A stayed scoped to name divergences).

Reaching a defensible **"reference implementation"** claim requires
closing the behavioural deviations above and extending verifiable
evidence (contract + property coverage) across the now-expanded
class set. v0.3.0 advanced cargo-domain coverage and 3.2.0
spec-correctness for the FWB spine; the reference-implementation
bar is a later milestone, not yet met.

## v0.4.0+ — beyond (aspirational)

Decisions to be made closer to the time. Candidates:

- **Performance optimization** — graph-walk dispatch is opt-in due
  to a perf budget; a later version may flip the default on if
  benchmarks justify.
- **Further cargo-domain expansions** beyond the FWB / security
  batch. Candidates: DangerousGoods, deeper Customs, temperature
  instructions, Booking-cluster extensions. Driven by integrator
  demand surfacing in issues / consumer use, not a fixed completion
  target.
- **Federation patterns library** — helpers for common
  cross-organization OneRecord interactions (multi-party
  AccessDelegation chains, subscription fan-out, change-request
  reconciliation).
- **TypeScript declaration improvements** driven by consumer
  feedback.
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
