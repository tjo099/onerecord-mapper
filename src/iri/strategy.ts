// src/iri/strategy.ts

declare const SafeIriBrand: unique symbol

/**
 * Branded IRI string. Production code may only obtain `SafeIri` via
 * `validateIri` or `IriStrategy.build`. The brand prevents passing
 * untrusted strings into IRI-shaped fields.
 */
export type SafeIri = string & { readonly [SafeIriBrand]: true }

export interface IriParts {
  tenant: string
  uuid: string
  host?: string
}

/** Class name union — narrowed to the v0.1.0 ~32 classes during Phase 5–11 wiring. */
export type ClassName = string

export interface IriStrategy {
  /** Scheme allowlist for outputs. Default impl uses `['https']`. */
  readonly allowedSchemes: readonly string[]
  /** Build an IRI for a class instance. Output MUST satisfy validateIri. */
  build(className: ClassName, parts: IriParts): SafeIri
  /** Optional host allowlist for further egress restriction. */
  readonly allowedHosts?: readonly string[]
}
