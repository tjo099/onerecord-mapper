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

## Release gate

Version `0.5.0` is release-ready only when:

- typecheck, lint, unit, property and package-surface tests pass;
- official IATA example-derived API wire fixtures pass;
- Cargo ERP, Skidd and Booking Portal compile against this version;
- end-to-end tests prove both Flaks-optimized and standards-only exchange.
