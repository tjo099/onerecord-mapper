// src/error/format.ts
import type { ParseError } from '../result.js'
import { assertNever } from './assert-never.js'

/**
 * Human-readable single-line summary of a ParseError.
 * Switch is exhaustive over all 22 kinds — assertNever guards compile-time completeness.
 */
export function formatError(e: ParseError): string {
  switch (e.kind) {
    case 'unknown_context':
      return `unknown_context at ${e.path}: got ${e.got} (allowed: ${e.expected.join(', ')})`

    case 'mixed_context':
      return `mixed_context at ${e.path}: got [${e.got.join(', ')}] (allowed: ${e.allowed.join(', ')})`

    case 'missing_type':
      return `missing_type at ${e.path}${e.objectId != null ? ` (id=${e.objectId})` : ''}`

    case 'unknown_type':
      return `unknown_type at ${e.path}: got ${e.got}${e.objectId != null ? ` (id=${e.objectId})` : ''}`

    case 'wrong_type_for_endpoint':
      return `wrong_type_for_endpoint at ${e.path}: expected ${e.expected}, got ${e.got}`

    case 'missing_id':
      return `missing_id at ${e.path}: objectType=${e.objectType}`

    case 'invalid_iri':
      return `invalid_iri at ${e.path}: ${e.reason} (got=${e.got})`

    case 'duplicate_id_in_graph':
      return `duplicate_id_in_graph at ${e.path}: iri=${e.iri}`

    case 'cardinality_violation':
      return `cardinality_violation at ${e.path}: ${e.field} expected ${e.expected}, got ${e.got}`

    case 'circular_reference':
      return `circular_reference: cycle=[${e.cyclePath.join(' -> ')}]`

    case 'zod_validation':
      return `zod_validation: ${e.issues.length} issue(s) at ${e.issues[0]?.path ?? '$'}`

    case 'forbidden_state_transition':
      return `forbidden_state_transition at ${e.path}: ${e.from} -> ${e.to}${e.reason != null ? ` (${e.reason})` : ''}`

    case 'operation_field_not_allowed':
      return `operation_field_not_allowed: field=${e.field} (allowed: ${e.allowedFields.join(', ')})`

    case 'change_partial_failure':
      return `change_partial_failure: failed at op #${e.failedAt}/${e.total} — ${formatError(e.cause)}`

    case 'payload_too_large':
      return `payload_too_large: ${e.sizeBytes} bytes (limit=${e.limitBytes})`

    case 'depth_limit_exceeded':
      return `depth_limit_exceeded at ${e.path}: depth=${e.depth} (limit=${e.limit})`

    case 'node_count_limit_exceeded':
      return `node_count_limit_exceeded: count=${e.count} (limit=${e.limit})`

    case 'string_too_long':
      return `string_too_long at ${e.path}: length=${e.length} (limit=${e.limit})`

    case 'array_too_long':
      return `array_too_long at ${e.path}: length=${e.length} (limit=${e.limit})`

    case 'prototype_pollution_attempt':
      return `prototype_pollution_attempt at ${e.path}: key=${e.key}`

    case 'incompatible_ontology_version':
      return `incompatible_ontology_version: server=${e.serverVersion}, mapper=${e.mapperVersion}`

    case 'invalid_pointer':
      return `invalid_pointer at ${e.path}: ${e.reason} (pointer=${e.pointer})`

    default:
      return assertNever(e)
  }
}
