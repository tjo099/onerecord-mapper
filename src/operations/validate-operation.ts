// src/operations/validate-operation.ts
import type { ParseResult } from '../result.js'
import type { OperationLike } from './apply-change.js'
import type { JsonPointer } from './json-pointer.js'

/**
 * v2 (A3-M1): allowedFields is `ReadonlyArray<JsonPointer | RegExp>` — NO bare
 * string arm. Literal pointers must be branded via `asJsonPointer(...).value`
 * first. This matches spec §13.
 */
export function validateOperation(
  op: OperationLike,
  allowedFields: ReadonlyArray<JsonPointer | RegExp>,
): ParseResult<OperationLike> {
  if (allowedFields.length === 0) return { ok: true, value: op }
  for (const allowed of allowedFields) {
    if (typeof allowed === 'string') {
      if (op.path === allowed) return { ok: true, value: op }
    } else if (allowed.test(op.path)) {
      return { ok: true, value: op }
    }
  }
  return {
    ok: false,
    error: {
      kind: 'operation_field_not_allowed',
      field: op.path,
      allowedFields: allowedFields.map((f) => (typeof f === 'string' ? f : f.source)),
    },
  }
}
