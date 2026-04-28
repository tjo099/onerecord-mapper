/**
 * Domain-semantic constraints that the v0.1.x Zod schemas mark as
 * optional but spec §5.x requires. Used by `dispatchGraphWalk` to emit
 * `domain_constraint_violation` for missing-but-required fields.
 *
 * Closes deviation #6 PARTIALLY (v0.2 — deferral F):
 *  - graph-cardinality (this file) — DONE
 *  - AWB number consistency between Waybill ↔ embedded Shipments — v0.3
 *  - total-pieces / total-weight sums between Shipment ↔ Pieces — v0.3
 *  - reference resolvability for cross-graph IRIs — v0.3
 *
 * v0.2 scope chosen for high spec-fidelity-per-LOC ratio: cardinality
 * is a clear-cut spec rule (`MUST have`) and surfaces meaningful
 * violations early. The other sub-items require either deeper graph
 * traversal (sums) or external resolution (resolvability).
 *
 * Opt-in via the dispatch path; default per-class deserializers stay
 * v0.1.x-permissive.
 */

export interface DomainConstraint {
  /** Field that must be present on the root LO. */
  field: string
  /** Cardinality requirement (`required` = present + non-null). */
  cardinality: 'required'
  /** Spec section reference for the constraint. */
  specRef: string
}

export const DOMAIN_CONSTRAINTS: Readonly<Record<string, DomainConstraint[]>> = Object.freeze({
  Waybill: [
    {
      field: 'shipmentInformation',
      cardinality: 'required',
      specRef: 'data model 3.2 §5.1',
    },
  ],
  Shipment: [
    {
      field: 'containedPieces',
      cardinality: 'required',
      specRef: 'data model 3.2 §5.2',
    },
  ],
})

export interface DomainConstraintViolation {
  className: string
  field: string
  expected: 'required'
  specRef: string
}

/**
 * Validate root-level cardinality constraints for the given root class.
 * Returns the FIRST missing-required-field violation, or undefined if all
 * required fields are present.
 *
 * Only checks root-level constraints — nested LO-in-LO cardinality is
 * deferred to v0.3 (alongside the other deviation #6 sub-items).
 */
export function checkDomainConstraints(
  rootClass: string,
  root: Record<string, unknown>,
): DomainConstraintViolation | undefined {
  const constraints = DOMAIN_CONSTRAINTS[rootClass]
  if (!constraints) return undefined
  for (const c of constraints) {
    const v = root[c.field]
    if (v === undefined || v === null) {
      return {
        className: rootClass,
        field: c.field,
        expected: c.cardinality,
        specRef: c.specRef,
      }
    }
    if (Array.isArray(v) && v.length === 0) {
      return {
        className: rootClass,
        field: c.field,
        expected: c.cardinality,
        specRef: c.specRef,
      }
    }
  }
  return undefined
}
