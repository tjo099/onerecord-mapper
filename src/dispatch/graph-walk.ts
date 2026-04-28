import type { ParseError, ParseResult } from '../result.js'
import { walkGraph } from '../safety/walk-graph.js'
import { checkContextOrder } from './context-order.js'
import { expectedTypeFor } from './field-types.js'
import { checkIriCanonical, looksLikeIri } from './iri-canonical.js'

/**
 * Cross-node graph integrity analysis. Runs as a single walk via
 * `walkGraph`'s visitor; emits at most one of:
 *  - `duplicate_id_in_graph` — two distinct nodes share an `@id`.
 *  - `missing_id` — a node embedded in a cross-reference position has no `@id`.
 *  - `wrong_type_for_endpoint` — a node's `@type` does not match the
 *    declared expected type for the field that references it.
 *  - `missing_type` — a non-leaf node lacks `@type`.
 *  - `iri_not_canonical` — an IRI string is not in canonical form
 *    (lowercase scheme/host, no default port; RFC 3987 + spec §3.2).
 *
 * Returns `ok: true` if the graph is structurally sound (per spec §3.2 + §7.1).
 *
 * Does NOT replace per-class Zod schema validation — that runs after this
 * pass succeeds, in `dispatch.deserialize.<Class>`.
 *
 * v0.2: containing-class tracking via path-keyed map of object @types,
 * so `wrong_type_for_endpoint` and `missing_id` checks fire for all
 * embedded references, not just direct children of the root.
 */
export function dispatchGraphWalk(input: unknown, rootClass: string): ParseResult<true> {
  // context_order_violation (deviation #10 closure, deferral E): if the
  // root @context is an array, verify the LAST element is allowed.
  // Per JSON-LD 1.1 §3.7 later items override earlier ones for term
  // definitions; the last item is the effective cargo-term context.
  // String-form @context is delegated to assertContextAllowed (already
  // runs in the per-class deserializer).
  if (typeof input === 'object' && input !== null && '@context' in input) {
    const ctx = (input as Record<string, unknown>)['@context']
    const orderR = checkContextOrder(ctx)
    if (!orderR.ok && orderR.lastUnallowed !== undefined) {
      return {
        ok: false,
        error: {
          kind: 'context_order_violation',
          got: ctx as string[],
          lastUnallowed: orderR.lastUnallowed,
          path: '$["@context"]',
        },
      }
    }
  }

  const seen = new Map<string, string>() // @id -> first path seen
  // Path-keyed @type lookup: maps each object node's path to its declared
  // (or root-defaulted) @type. Used to resolve the containing class when
  // checking wrong_type_for_endpoint / missing_id at any depth.
  const pathToType = new Map<string, string>()
  pathToType.set('$', rootClass)
  let firstError: ParseError | undefined

  const walkR = walkGraph(input, {}, (node, path, _depth) => {
    if (firstError) return // short-circuit on first error

    // iri_not_canonical: check every IRI-shaped string value in the
    // graph (deviation #9 closure, deferral D). Runs before the
    // object-only checks below because string values are visited
    // separately by walkGraph.
    if (typeof node === 'string' && looksLikeIri(node)) {
      const r = checkIriCanonical(node)
      if (!r.canonical && r.reason) {
        firstError = {
          kind: 'iri_not_canonical',
          iri: node,
          reason: r.reason,
          path,
        }
      }
      return
    }

    if (typeof node !== 'object' || node === null || Array.isArray(node)) return

    const obj = node as Record<string, unknown>
    const id = typeof obj['@id'] === 'string' ? obj['@id'] : undefined
    const type = typeof obj['@type'] === 'string' ? obj['@type'] : undefined

    // Record this object's @type by path so children can find their
    // containing class. Falls back to rootClass for the root path.
    if (type) pathToType.set(path, type)

    // missing_type: every non-leaf node must declare @type
    if (!type && hasObjectChildren(obj)) {
      firstError = { kind: 'missing_type', path }
      return
    }

    const parentField = pathToParentField(path)
    const containingClass = parentField ? containingClassFor(path, pathToType) : undefined

    // missing_id: nodes embedded in cross-reference positions must have @id.
    // Cross-reference positions are fields in FIELD_TYPES for the containing class.
    if (parentField && containingClass && !id && requiresId(parentField, containingClass)) {
      firstError = {
        kind: 'missing_id',
        objectType: type ?? 'unknown',
        path,
      }
      return
    }

    // duplicate_id_in_graph
    if (id) {
      if (seen.has(id)) {
        firstError = { kind: 'duplicate_id_in_graph', iri: id, path }
        return
      }
      seen.set(id, path)
    }

    // wrong_type_for_endpoint: embedded @type must match the field's
    // expected class. Now checked at any depth — containing class
    // resolved via the path-keyed @type map.
    if (type && parentField && containingClass) {
      const expected = expectedTypeFor(containingClass, parentField)
      if (expected && expected !== '*' && expected !== type) {
        firstError = {
          kind: 'wrong_type_for_endpoint',
          expected,
          got: type,
          path,
        }
      }
    }
  })

  if (!walkR.ok) return walkR // safety-limit error
  if (firstError) return { ok: false, error: firstError }
  return { ok: true, value: true }
}

function hasObjectChildren(obj: Record<string, unknown>): boolean {
  for (const v of Object.values(obj)) {
    if (typeof v === 'object' && v !== null) return true
  }
  return false
}

/**
 * Path format: `$`, `$.<field>`, `$.<field>[<n>]`, `$.<field>.<sub>`,
 * `$.<field>[<n>].<sub>`. Returns the immediate parent field name.
 * Returns `undefined` for the root path `$`.
 */
function pathToParentField(path: string): string | undefined {
  if (path === '$') return undefined
  const last = path.split('.').pop()
  if (!last) return undefined
  return last.replace(/\[\d+\]$/, '') // strip array index suffix
}

/**
 * Resolve the containing class for the node at `path` by looking up the
 * @type recorded at the parent object's path. Skips array-index segments
 * (those don't carry their own @type).
 *
 * Examples (rootClass = 'Waybill'):
 *  - `$.shipmentInformation` → parent path `$` → 'Waybill'
 *  - `$.shipmentInformation.consignee` → parent path `$.shipmentInformation`
 *    → whatever @type was declared on that node (typically 'Shipment')
 *  - `$.containedPieces[0]` → strip `[0]` then `.containedPieces` → '$' → 'Waybill'
 *    (the array container itself isn't an object node so we step past it)
 *  - `$.containedPieces[0].dimensions` → parent path `$.containedPieces[0]`
 *    → @type at that path (typically 'Piece')
 */
function containingClassFor(path: string, pathToType: Map<string, string>): string | undefined {
  if (path === '$') return undefined
  // Strip the trailing `.field` or `[N]` segment to get the parent path.
  const stripped = path.replace(/\[\d+\]$/, '')
  const lastDot = stripped.lastIndexOf('.')
  if (lastDot < 0) return undefined
  let parentPath = stripped.slice(0, lastDot)
  if (parentPath === '') parentPath = '$'
  return pathToType.get(parentPath)
}

/**
 * A field requires `@id` on referenced nodes if it's in `FIELD_TYPES`
 * for the given containing class (= the field points at another
 * logistics-object node). Scalar fields and unmapped fields don't
 * require `@id`.
 */
function requiresId(parentField: string, containingClass: string): boolean {
  return expectedTypeFor(containingClass, parentField) !== undefined
}
