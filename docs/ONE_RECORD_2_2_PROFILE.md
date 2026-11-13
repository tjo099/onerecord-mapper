# Flaks ONE Record production profile

This package targets the endorsed ONE Record production baseline:

- API and API ontology `2.2.0`
- Cargo ontology `3.2.0`
- Data orchestration `1.1.0`

The IATA development branch is monitored for forward compatibility, but a
development capability is not advertised until the implementing application
passes its contract and interoperability tests.

## Required server surface

Every Flaks product that hosts logistics data implements:

- authenticated `GET /` returning `api:ServerInformation`;
- `GET` and `HEAD` for supported Logistics Objects;
- Logistics Event read/write appropriate to the product's data ownership;
- Action Requests, including third-party changes through `api:ChangeRequest`;
- Access Delegation;
- Subscription discovery/request and Notification delivery;
- OIDC client-credentials authentication with asymmetric signing and public
  JWKS;
- JSON-LD `application/ld+json` content negotiation;
- stable, globally dereferenceable Organization and Logistics Object IRIs;
- audit/history appropriate to objects the product owns.

`api:hasSupportedOntology` contains non-versioned ontology IRIs. The matching
versioned IRIs belong in `api:hasSupportedOntologyVersion`.

## Flaks Connect

Flaks Connect is the Flaks-sphere setup and relationship lifecycle fabric. It
does not replace any application's ONE Record interface.

For a Flaks-to-Flaks relationship, Connect provisions:

1. the existing optimized product channel; and
2. a secretless `OneRecordPeerProfile` describing the standards interface.

Skidd owns initiation of `HANDLES_FOR`. Booking Portal owns initiation of
`SELLS_FOR`. Cargo ERP's airline tenant owns approval. Consumers capture and
activate approval results in the background.

External standards-only peers do not need a Flaks Connect client. They discover
and interact with each product through its ONE Record server and Organization
URI.

## Wire rules for the Quote & Book chain (0.6.0)

These rules apply to `Price`, `Ratings`, `TransportLegs`, `BookingOption`,
`BookingRequest` and `Booking`, and to every other class where the same
mechanism applies.

### Multi-valued properties require a JSON array

A property that the ontology allows more than once is always a JSON array,
even when it carries a single value. JSON-LD peers sometimes compact a
one-element array to a scalar; this package does not accept that form.
`Booking.additionalInformation: "x"` is rejected as `zod_validation` at path
`additionalInformation`; `["x"]` is accepted. An empty array (`[]`) is
rejected as `cardinality_violation`; omit the key instead. Note that
`BookingOption.additionalInformation` is single-valued (a string), while
`Booking.additionalInformation` is multi-valued (an array of strings).

### Free text under the graph walk

Whitespace-free strings in non-IRI fields that contain a scheme-like prefix (e.g. `URGENT:Handle`, or a website `HTTPS://Example.com/x` in `ContactDetail.textualValue`) are still checked for canonical IRI form under the graph walk and can yield `iri_not_canonical` (deviation #9).

### Reference IRIs are canonicalised, `@id` is kept verbatim

`safeIri` canonicalises every reference IRI it parses: it lowercases the
scheme and host and adds `/` for an empty path. A node's own `@id` is not
touched. A consumer that joins a reference (for example `Price.ratings[i]`) to
the `@id` of another node must therefore compare canonical forms of both; a
peer that publishes a Ratings node with an upper-case host in its `@id` will
not match a plain string comparison. Under the graph walk
(`dispatchGraphWalk`, `createMapper({ graphWalk: true })`) the same
non-canonical value is reported as `iri_not_canonical`.

### Quote & Book amounts: currency

`Price.grandTotal` and `Ratings.subTotal` are plain numbers. The ONE Record
3.2.0 ontology defines no currency on `:Price` or `:Ratings` (deviation #20).

- A producer SHOULD set `BookingOption.unitsPreference.currency` whenever the
  option carries a `Price`. It is a preference, not a per-amount statement.
- A receiver MAY fall back to the currency units of the related Waybill's
  `CurrencyValue` fields when the preference is absent.

The package enforces neither rule.

### Duplicate IRIs in `Price.ratings`

`Price.ratings` is validated as an array of IRIs and duplicates are accepted.
A consumer that sums `Ratings.subTotal` over `Price.ratings` MUST de-duplicate
the (canonicalised) IRIs first, or it double-counts.

## Release gate

Version `0.5.0` is release-ready only when:

- typecheck, lint, unit, property and package-surface tests pass;
- official IATA example-derived API wire fixtures pass;
- Cargo ERP, Skidd and Booking Portal compile against this version;
- end-to-end tests prove both Flaks-optimized and standards-only exchange.
