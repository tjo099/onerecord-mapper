# @flaks/onerecord

Zero-dependency Zod-first TypeScript mapper for the IATA OneRecord cargo data model 3.2 and API spec 2.2.0.

## What it is

`@flaks/onerecord` provides round-trip-safe serialization and deserialization for
32 OneRecord cargo data model classes. Each class ships with a Zod schema, an
application-layer TypeScript type, a `JsonLd<T>` brand, `serialize` / `serializeStrict`
/ `deserialize` functions, and a `Codec` bundle. A factory (`createMapper`) and a
namespaced facade (`onerecord`) cover the two main consumption patterns. Safety
primitives (depth, node, string, array, payload limits; prototype-pollution defense;
IRI validation) run before Zod so that invalid JSON-LD graphs never reach schema
evaluation. All 22 parse-error variants are typed as a discriminated union (`ParseError`)
so callers handle every failure mode exhaustively.

## Why use this library?

Air cargo is migrating to OneRecord — IATA's JSON-LD-based replacement for
EDIFACT / Cargo-IMP messaging. As of January 2026, roughly 8% of the
industry has adopted; the standard is endorsed but the TypeScript tooling
ecosystem is sparse. `@flaks/onerecord` fills that gap.

Use this library if you're building cargo software that needs to:

- **Accept** OneRecord JSON-LD from external endpoints with strict
  validation (Zod schemas + cardinality + IRI + a pre-Zod safety pass).
- **Emit** spec-compliant JSON-LD with stable round-trip semantics
  (`serialize(deserialize(x)) == x` per spec §7.1).
- **Refuse** malformed graphs early — depth bombs, prototype-pollution
  attempts, empty arrays on the wire, circular references — before they
  reach Zod or your downstream code.
- **Type-check** every parse-failure path: `ParseError` is a 22-variant
  discriminated union, so the compiler tells you when you've forgotten a
  failure mode.

Skip it if you want a generic JSON-LD or RDF toolkit; this is purpose-built
for the IATA cargo ontology and the ONE Record API spec 2.2.0.

## Status

`v0.1.0` covers the 32 canonical cargo data model classes (Ring 1–5 plus
the booking-flow classes) with full round-trip codecs, Zod schemas,
snapshot tests, property-based round-trip tests, and pre-Zod safety
primitives. The library is Apache-2.0 and ready for use within the v0.x
stability policy described in [`MIGRATING.md`](MIGRATING.md).

Spec compliance: cargo data model **3.2 (2025-07 endorsed standard)**, API
spec **2.2.0**. A small number of deliberate divergences from canonical
spec behavior are documented in
[`docs/spec-deviations.md`](docs/spec-deviations.md); read that before
adopting if your integration must match the spec verbatim.

## Install

```bash
bun add git+https://github.com/tjo099/onerecord-mapper#v0.1.0
```

Pin to a specific tag for production use. Per `MIGRATING.md`, minor
versions may introduce breaking changes documented in `CHANGELOG.md`;
patch versions will not. A future v0.2.0 release will additionally
publish to npm as the public scoped package `@flaks/onerecord`.

## Usage

### Round-trip with `WaybillCodec`

```typescript
import { WaybillCodec } from '@flaks/onerecord'

// Deserialize raw JSON-LD from the wire
const result = WaybillCodec.deserialize(rawJsonLd)
if (result.ok) {
  const waybill = result.value          // typed as Waybill (application object)
  const jsonLd = WaybillCodec.serialize(waybill)  // back to JsonLd<Waybill>
} else {
  console.error(formatError(result.error))
}
```

### `createMapper` with custom limits

```typescript
import { createMapper } from '@flaks/onerecord'

const mapper = createMapper({
  limits: { maxDepth: 12, maxNodes: 500, maxPayloadBytes: 512_000 },
  iriStrategy: 'strict',
  allowedSchemes: ['https'],
})

const result = mapper.deserialize.Waybill(rawJsonLd)
const jsonLd  = mapper.serialize.Waybill(waybill)
```

### `onerecord` namespaced facade

```typescript
import { onerecord, formatError } from '@flaks/onerecord'

// One-off operations, no factory state
const result = onerecord.deserialize.Shipment(rawJsonLd)
if (!result.ok) {
  throw new Error(formatError(result.error))
}
const jsonLd = onerecord.serialize.Piece(piece)
```

## API overview

### Per-class exports

Each of the 32 classes exposes:

| Export | Description |
|---|---|
| `<Class>Schema` | Zod schema for the application object |
| `<Class>Codec` | `{ serialize, serializeStrict, deserialize }` bundle |
| `serialize<Class>(obj)` | Returns `JsonLd<T>` |
| `deserialize<Class>(raw)` | Returns `Result<T, ParseError>` |

### Factory

```typescript
createMapper(opts: {
  limits?: Partial<SafetyLimits>
  iriStrategy?: 'strict' | 'lenient'
  allowedSchemes?: string[]
}): BoundMapper
```

Returns a mapper with bound `serialize.<Class>` and `deserialize.<Class>` methods
using deep-frozen options set at creation time.

### Facade

```typescript
onerecord.deserialize.<Class>(raw): Result<T, ParseError>
onerecord.serialize.<Class>(obj): JsonLd<T>
```

No bound state; suitable for one-off operations and tree-shake-friendly imports.

### Errors

- `ParseError` — 22-variant discriminated union (`kind` field); covers
  `zod_validation`, `cardinality_violation`, `invalid_iri`, `depth_limit_exceeded`,
  `prototype_pollution_attempt`, `invalid_pointer`, and 16 more
- `SerializationError` — `code: 'invalid_application_object' | 'iri_construction_failed'`
- `formatError(e: ParseError): string` — human-readable message
- `redactError(e: ParseError): ParseError` — strips PII from error payloads before logging

### Booking state machine

```typescript
import { STATE_DIAGRAM, canTransition } from '@flaks/onerecord'

canTransition(from, to)            // boolean predicate
acceptBookingRequest(req)          // typed transition → BookingOption
acceptBookingOption(opt)           // typed transition → Booking
rejectBookingOption(opt)           // typed transition → BookingOption
revokeBookingOption(opt)           // typed transition → BookingOption
```

### Operations (JSON-Patch per spec §6.5)

```typescript
import { applyChange, validateOperation, asJsonPointer } from '@flaks/onerecord'

applyChange(codec, obj, change)         // returns Result<T, ParseError>
validateOperation(op, allowedFields)    // validates op.s against allowed field list
asJsonPointer(path)                     // typed JsonPointer helper
```

### FSU codes

```typescript
import { FSU_EVENT_CODES } from '@flaks/onerecord'
// Record<string, FsuEventCode> — 26-code map per IATA XFSU spec
```

### Safety primitives

```typescript
import { DEFAULT_SAFETY_LIMITS, mergeLimits } from '@flaks/onerecord'
// DEFAULT_SAFETY_LIMITS: SafetyLimits (depth, nodes, strings, arrays, payloadBytes)
// mergeLimits(base, overrides): SafetyLimits
```

### IRI utilities

```typescript
import { safeIri, validateIri, defaultIriStrategy } from '@flaks/onerecord'
// safeIri()             — Zod helper; lifts IRI failures into kind: 'invalid_iri'
// validateIri(s)        — Result<SafeIri, ParseError>
// defaultIriStrategy    — IriStrategy with https-only scheme enforcement
```

## Architecture notes

- **Zero runtime dependencies** other than Zod (peer).
- **Round-trip safety**: serialize(deserialize(x)) == x per spec §7.1 tolerance.
  Deserialized application objects carry no `@context` or `@type` noise; `serialize`
  reconstructs the canonical JSON-LD envelope.
- **Pre-Zod safety pass**: before any schema evaluation, `preValidate` enforces
  depth, node count, string length, array length, and payload-byte limits; detects
  prototype-pollution keys (`__proto__`, `constructor`, `prototype`); and unwinds
  JS-level circular references. Zod never sees a malformed graph.
- **Empty arrays rejected** at any depth as `cardinality_violation`. The spec
  mandates omitting a field rather than sending `[]`; this is enforced pre-Zod.
- **Null-prototype output**: all deserialized graphs are built on `Object.create(null)`
  objects. Consumer code cannot accidentally read or pollute `Object.prototype`
  through a deserialized value.
- **Branded types**: `SafeIri` (validated IRI string) and `JsonLd<T>` (serialized
  graph) are distinct branded types. TypeScript prevents passing a raw string where
  a `SafeIri` is required, and passing an application object where `JsonLd<T>` is
  expected.

## Tree-shaking

For maximum bundle size optimization, import from the `/codecs` subpath:

```typescript
import { WaybillCodec } from '@flaks/onerecord/codecs'
import { ShipmentCodec } from '@flaks/onerecord/codecs'
```

Type-only imports (zero runtime cost):

```typescript
import type { Waybill, ParseError } from '@flaks/onerecord/types'
```

## Version pins

| Spec | Version |
|---|---|
| Cargo data model | 3.2 (2025-07 endorsed standard) |
| API spec | 2.2.0 |

## Development

```bash
bun install
bun run test       # 518 passing + 10 skipped = 528 total
bun run lint       # Biome
bun run typecheck  # tsc --noEmit
```

## License

[Apache-2.0](LICENSE)
