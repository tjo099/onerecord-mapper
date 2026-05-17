# Conformance Matrix — v0.3.0

Maps each new class and key corrected field to its binding authority in the
IATA ONE Record Data Model Ontology 3.2.0 (the endorsed release self-labels
`owl:versionInfo "3.2-rc2"`; source file `IATA-1R-DM-Ontology.ttl`).
Line numbers are term-anchored (grep-verified) and advisory: TTL line numbers
may drift with re-generation; grep for `:TermName` to locate.

**Conformance statuses used below:**

| Symbol | Meaning |
|---|---|
| `3.2.0` | Fully conformant with endorsed 3.2.0 ontology (3.2-rc2 file) |
| `3.2.1-forward` | Present as optional/accepted field; no 3.2.0 restriction wiring; master-only PRs #344/#346 |
| `deprecated-3.2-rc2` | Term exists in 3.2.0, carries `owl:deprecated true` |
| `D6-pragmatic` | Ontologically unbounded (no `owl:maxCardinality`), modelled as single `.optional()` — pragmatic FWB reading (directive D6) |

---

## New Classes (v0.3.0)

| Class | TTL line | Status | Test file |
|---|---|---|---|
| `Company` | ~6113 `:Company rdf:type owl:Class` | `3.2.0` | `test/unit/classes/company.test.ts` |
| `WaybillLineItem` | ~10271 `:WaybillLineItem rdf:type owl:Class` | `3.2.0` | `test/unit/classes/waybill-line-item.test.ts` |
| `OtherCharge` | ~7956 `:OtherCharge rdf:type owl:Class` | `3.2.0` | `test/unit/classes/other-charge.test.ts` |
| `CustomsInformation` | ~6244 `:CustomsInformation rdf:type owl:Class` | `3.2.0` | `test/unit/classes/customs-information.test.ts` |
| `Insurance` | ~6878 `:Insurance rdf:type owl:Class` | `3.2.0` | `test/unit/classes/insurance.test.ts` |
| `LineItemPackage` | ~7130 `:LineItemPackage rdf:type owl:Class` | `3.2.0` | `test/unit/classes/line-item-package.test.ts` |
| `ULD` | ~9701 `:ULD rdf:type owl:Class` | `3.2.0` | `test/unit/classes/uld.test.ts` |
| `CO2Emissions` | ~5788 `:CO2Emissions rdf:type owl:Class` | `3.2.0` | `test/unit/classes/co2-emissions.test.ts` |
| `RegulatedEntity` | ~9067 `:RegulatedEntity rdf:type owl:Class` | `3.2.0` | `test/unit/classes/regulated-entity.test.ts` |
| `SecurityDeclaration` | ~9106 `:SecurityDeclaration rdf:type owl:Class` | `3.2.0` | `test/unit/classes/security-declaration.test.ts` |

---

## Path-A Corrected Waybill Properties

| Field | TTL line | Status | Notes |
|---|---|---|---|
| `Waybill.shipment` | ~2318 `:shipment` | `3.2.0` | Replaces stale v0.2 `shipmentInformation` |
| `Waybill.involvedParties` | ~1390 `:involvedParties` | `3.2.0` | New in v0.3.0 |
| `Waybill.waybillLineItems` | ~2804 `:waybillLineItems` | `3.2.0` | New in v0.3.0 |
| `Waybill.otherCharges` | ~1769 `:otherCharges` | `3.2.0` | New in v0.3.0 |
| `Waybill.accountingInformation` | ~2856 `:accountingInformation` | `deprecated-3.2-rc2` | owl:deprecated true (~2861); FWB ACC segment still used; deviation #15 |

---

## Path-A Corrected Shipment Properties

| Field | TTL line | Status | Notes |
|---|---|---|---|
| `Shipment.pieces` | ~1979 `:pieces` | `3.2.0` | Replaces stale v0.2 `containedPieces` |
| `Shipment.waybill` | ~2795 `:waybill` | `3.2.0` | Replaces stale v0.2 `waybillOfPiece` pattern |
| `Shipment.involvedParties` | ~1390 `:involvedParties` | `3.2.0` | New in v0.3.0 |
| `Shipment.customsInformation` | ~814 `:customsInformation` | `3.2.0` | New in v0.3.0 |
| `Shipment.insurance` | ~1348 `:insurance` | `3.2.0` | New in v0.3.0 |
| `Shipment.securityDeclarations` | ~2228 `:securityDeclarations` | `3.2.1-forward` | Domain is `:Piece` in 3.2-rc2; no `:Shipment` restriction in 3.2.0; deviation #12 |

---

## Path-A Corrected Piece Properties

| Field | TTL line | Status | Notes |
|---|---|---|---|
| `Piece.securityDeclarations` | ~2228 `:securityDeclarations` | `3.2.0` | Piece restriction at ~8260 in 3.2-rc2 |
| `Piece.ofShipment` | (inverse of `:pieces`) | `3.2.0` | Correct inverse-property linkage |

---

## Path-A Corrected Party Properties

| Field | Status | Notes |
|---|---|---|
| `Party.partyDetails` widened to `IRI \| {@id}` | `3.2.0` | Now accepts Person or Company; NI role added |
| `Party.accountNumbers` | `3.2.0` | Unchanged |

---

## AccountNumber (from 1b.9b)

| Field | TTL line | Status | Notes |
|---|---|---|---|
| `AccountNumber.accountNumberType` | ~4780 (restriction on `:accountNumberType` ~185) | `3.2.0` | Replaces stale `accountType` |
| `AccountNumber.textualValue` | ~4788 (restriction on `:textualValue` ~4580) | `3.2.0` | Replaces stale `accountNumber` |

Full AccountNumber class at `IATA-1R-DM-Ontology.ttl@3.2-rc2:~4778-4797`.

---

## D6 — Ontologically Unbounded Fields (Directive D6)

The following fields have **no `owl:maxCardinality` restriction** in 3.2-rc2 and
are therefore ontologically unbounded (multiple values possible). v0.3.0 models
them as single `.optional()` following a pragmatic FWB reading (directive D6) —
FWB always emits exactly one value for these fields in practice.

| Field | TTL line | Conformance | Notes |
|---|---|---|---|
| `TransportMovement.co2Emissions` | ~610 `:co2Emissions` / ~5788 `:CO2Emissions` class | `D6-pragmatic` | Ontologically unbounded; modelled single `.optional()` per FWB (directive D6) |
| `Shipment.totalDimensions` | ~2532 `:totalDimensions` | `D6-pragmatic` | Ontologically unbounded; modelled single `.optional()` per FWB (directive D6) |

---

## Insurance Fields

| Field | TTL line | Status |
|---|---|---|
| `Insurance.coveringOrganization` | ~782 `:coveringOrganization` | `3.2.0` |
| `Insurance.insuredShipments` | ~1348 `:insurance` (inverse) | `3.2.0` |

---

## SecurityDeclaration / RegulatedEntity

| Field | TTL line | Status |
|---|---|---|
| `SecurityDeclaration.issuedForPiece` | ~1415 `:issuedForPiece` | `3.2.0` |
| `SecurityDeclaration.issuedForShipment` | ~1426 `:issuedForShipment` | NOT in v0.3.0 schema (strict-rejected); master-only; deviation #12 |
| `SecurityDeclaration.regulatedEntityIssuer` / `Acceptor` / `receivedFrom` / `otherRegulatedEntities` | via `:RegulatedEntity` ~9067 | `3.2.0` |
| `RegulatedEntity.owningOrganization` | via `:Company` ~6113 | `3.2.0` |

---

## CustomsInformation

| Field | TTL line | Status |
|---|---|---|
| `CustomsInformation.issuedForPiece` | ~1415 `:issuedForPiece` | `3.2.0` |
| `CustomsInformation.issuedForShipment` | ~1426 `:issuedForShipment` | `3.2.0` (issuedForShipment exists standalone in 3.2.0; the master-only restriction is on SecurityDeclaration only) |

---

*This matrix is authoritative for v0.3.0. Regenerate when new classes are added.*
