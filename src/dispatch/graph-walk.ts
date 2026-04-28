import type { ParseError, ParseResult } from '../result.js'
import { walkGraph } from '../safety/walk-graph.js'
import { expectedTypeFor } from './field-types.js'

/**
 * Cross-node graph integrity analysis. Runs as a single walk via
 * `walkGraph`'s visitor; emits at most one of:
 *  - `duplicate_id_in_graph` — two distinct nodes share an `@id`.
 *  - `missing_id` — a node embedded in a cross-reference position has no `@id`.
 *  - `wrong_type_for_endpoint` — a node's `@type` does not match the
 *    declared expected type for the field that references it.
 *  - `missing_type` — a non-leaf node lacks `@type`.
 *
 * Returns `ok: true` if the graph is structurally sound (per spec §3.2 + §7.1).
 *
 * Does NOT replace per-class Zod schema validation — that runs after this
 * pass succeeds, in `dispatch.deserialize.<Class>`.
 *
 * v0.2 limitation: `wrong_type_for_endpoint` is only checked for direct
 * children of the root node. Comprehensive containing-class tracking
 * for deeper nesting is deferred to v0.3 (deviation #6 closure).
 */
export function dispatchGraphWalk(input: unknown, rootClass: string): ParseResult<true> {
  const seen = new Map<string, string>() // @id -> first path seen
  let firstError: ParseError | undefined

  const walkR = walkGraph(input, {}, (node, path, _depth) => {
    if (firstError) return // short-circuit on first error
    if (typeof node !== 'object' || node === null || Array.isArray(node)) return

    const obj = node as Record<string, unknown>
    const id = typeof obj['@id'] === 'string' ? obj['@id'] : undefined
    const type = typeof obj['@type'] === 'string' ? obj['@type'] : undefined

    // missing_type: every non-leaf node must declare @type
    if (!type && hasObjectChildren(obj)) {
      firstError = { kind: 'missing_type', path }
      return
    }

    const parentField = pathToParentField(path)

    // missing_id: nodes embedded in cross-reference positions must have @id
    if (parentField && !id && requiresId(parentField, rootClass)) {
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

    // wrong_type_for_endpoint: embedded @type must match the field's expected class.
    // v0.2 only validates direct children of the root; deeper nesting is v0.3.
    if (type && parentField && isDirectChildOfRoot(path)) {
      const expected = expectedTypeFor(rootClass, parentField)
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
 * True for paths exactly one segment below the root (e.g. `$.field`,
 * `$.field[0]`). False for `$` itself or deeper paths.
 */
function isDirectChildOfRoot(path: string): boolean {
  if (path === '$') return false
  const segments = path.split('.').slice(1) // strip leading "$"
  return segments.length === 1
}

/**
 * A field requires `@id` on referenced nodes if it's in `FIELD_TYPES`
 * (= it points at another logistics-object node). Scalar fields and
 * unmapped fields don't require `@id`.
 *
 * v0.2 only checks direct children of root — same scope as
 * wrong_type_for_endpoint. Deeper nesting is v0.3.
 */
function requiresId(parentField: string, rootClass: string): boolean {
  return expectedTypeFor(rootClass, parentField) !== undefined
}
