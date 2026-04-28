// test/contract/_neone-client.ts
//
// Test harness for contract tests against the OLF NE:ONE Server. Provides:
//  - Keycloak client-credentials authentication
//  - Wire-format envelope adapter (our 3.2 lib <-> NE:ONE 1.x server)
//  - Authenticated fetch helpers (POST/GET) with JSON-LD content type
//
// Wire-format adapter notes (Phase 5 finding, 2026-04-28):
//  Our library produces JSON-LD with:
//    - @context as a string IRI ('https://onerecord.iata.org/ns/cargo')
//    - @type as a single literal ('Waybill')
//    - @id present (we mint it client-side)
//  The OLF NE:ONE Server (API spec 1.2.0, develop branch) accepts JSON-LD with:
//    - @context as an object: { '@vocab': '...#' } (note trailing #)
//    - @type as an array including 'LogisticsObject': ['Waybill', 'LogisticsObject']
//    - @id optional on POST (server assigns one and returns via Location header)
//  Field names + values pass through untouched in the develop branch's
//  current config — the adapter is a thin envelope translation only.
//
// Stricter-mode caveat: the same server in GraphDB-backed v3.2 ontology
// mode rejects bare-string OWL ObjectProperty values (e.g. waybillType,
// optionStatus, unit) and bare xsd literals (datetimes, doubles). If
// future contract tests run against that stricter mode, the adapter
// will need to wrap such values as { '@id': '<code-list-iri>#<code>' }
// and { '@type': '<xsd-iri>', '@value': '...' } respectively. Not
// applied today because the current develop-branch config accepts
// either form; v0.3 contract-test work will revisit if/when needed.
//
// Tests assume the local NE:ONE stack is up at http://localhost:8080 and
// Keycloak at http://localhost:8989 (per F:/dev/one-server/ne-one/
// docker-compose.fix-oidc.yml). Set NEONE_URL / NEONE_KEYCLOAK_URL /
// NEONE_REALM / NEONE_CLIENT_ID / NEONE_CLIENT_SECRET env vars to override.

const NEONE_URL = process.env.NEONE_URL ?? 'http://localhost:8080'
const KEYCLOAK_URL = process.env.NEONE_KEYCLOAK_URL ?? 'http://localhost:8989'
const REALM = process.env.NEONE_REALM ?? 'neone'
const CLIENT_ID = process.env.NEONE_CLIENT_ID ?? 'neone-client'
// Default credential is the well-known dev secret committed in the upstream
// NE:ONE develop branch's application.properties (line 85 in the OLF repo).
const CLIENT_SECRET = process.env.NEONE_CLIENT_SECRET ?? 'lx7ThS5aYggdsMm42BP3wMrVqKm9WpNY'

let cachedToken: { value: string; expiresAt: number } | undefined

/**
 * Fetch an OIDC client-credentials access token from Keycloak. Cached
 * in-process; refreshed when within 30s of expiry.
 */
export async function getNeoneToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.value
  const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(
      `NE:ONE Keycloak auth failed: ${res.status} ${res.statusText} — is the stack up at ${KEYCLOAK_URL}?`,
    )
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  }
  return json.access_token
}

/** Per-namespace IRI bases for OneRecord code lists (gotcha #3). */
const CARGO_NS = 'https://onerecord.iata.org/ns/cargo#'
const CODE_LIST_BASE = 'https://onerecord.iata.org/ns/code-lists'
const XSD = 'http://www.w3.org/2001/XMLSchema#'

/**
 * Map of `<ClassName>.<fieldName>` → IRI base for ObjectProperty fields
 * whose string values are NamedIndividuals. Per the user's empirical
 * gotchas memory, the GraphDB-backed v3.2 mode rejects bare-string
 * values for these fields with HTTP 400 "Invalid RDF model".
 *
 * Cargo NamedIndividuals (waybillType MASTER/HOUSE, status enums) live
 * directly under the cargo namespace. Code-list values (KGM, MTQ, FFW,
 * etc.) live under per-list sub-namespaces.
 */
const OBJECT_PROPERTY_BASES: Readonly<Record<string, string>> = Object.freeze({
  // Cargo NamedIndividuals
  'Waybill.waybillType': CARGO_NS,
  'BookingRequest.requestStatus': CARGO_NS,
  'BookingOption.optionStatus': CARGO_NS,
  'BookingOptionRequest.requestStatus': CARGO_NS,
  'Booking.bookingStatus': CARGO_NS,
  'MovementTime.movementTimeType': CARGO_NS,
  'MovementTime.direction': CARGO_NS,
  'Operation.op': CARGO_NS,
  // Code-list sub-namespaces
  'Party.partyRole': `${CODE_LIST_BASE}/ParticipantIdentifier#`,
  'AccountNumber.accountType': `${CODE_LIST_BASE}/AccountType#`,
  // unit fields on weight/volume — handled separately because they're nested
})

/**
 * Wrap a bare string value as `{ '@id': '<base><value>' }` if a base is
 * known; otherwise leave as-is.
 */
function wrapObjectPropertyValue(className: string, fieldName: string, value: unknown): unknown {
  if (typeof value !== 'string') return value
  const base = OBJECT_PROPERTY_BASES[`${className}.${fieldName}`]
  if (!base) return value
  return { '@id': `${base}${value}` }
}

/**
 * Wrap a bare numeric value as `{ '@type': xsd:double, '@value': '...' }`.
 * Per gotcha #4 — the GraphDB-backed mode rejects bare numeric literals
 * for typed fields.
 */
function wrapXsdDouble(value: unknown): unknown {
  if (typeof value !== 'number') return value
  return { '@type': `${XSD}double`, '@value': value.toString() }
}

/**
 * Recursively wrap unit fields and numeric values inside weight/volume
 * objects. Applied to nested {unit, value} sub-resources only.
 */
function wrapUnitObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'unit' && typeof v === 'string') {
      out[k] = { '@id': `${CODE_LIST_BASE}/MeasurementUnitCode#${v}` }
    } else if (k === 'value' && typeof v === 'number') {
      out[k] = wrapXsdDouble(v)
    } else {
      out[k] = v
    }
  }
  return out
}

/** Fields that hold a {unit, value} sub-object (or an array of them). */
const UNIT_BEARING_FIELDS = new Set([
  'totalGrossWeight',
  'totalVolume',
  'grossWeight',
  'dimensions',
])

/**
 * Convert our 3.2 lib's JSON-LD output into the envelope shape NE:ONE
 * accepts. Per the user's gotchas memory (project_onerecord_gotchas.md),
 * RDF-strict-mode validation requires:
 *
 *  1. `@context` string → object `{ '@vocab': '<cargo-iri>#' }`
 *  2. `@type` literal → array `[<original>, 'LogisticsObject']`
 *  3. `@id` stripped — server assigns its own base-IRI-prefixed @id and
 *     returns via Location header (client-minted IRIs are rejected with
 *     HTTP 406 "Invalid address path for IRI")
 *  4. Object-property values (`waybillType: 'MASTER'`, etc.) wrapped as
 *     `{ '@id': '<NamedIndividual-iri>' }` — see OBJECT_PROPERTY_BASES
 *  5. Unit fields (`unit: 'KGM'`) wrapped as
 *     `{ '@id': '<MeasurementUnitCode#KGM>' }`
 *  6. Numeric values inside weight/volume sub-objects wrapped as
 *     `{ '@type': xsd:double, '@value': '...' }`
 *
 * Today's NE:ONE develop branch is more permissive than this and accepts
 * bare strings/numerics. The defensive wrapping ensures the contract
 * tests also pass against the stricter GraphDB-backed v3.2 mode.
 */
export function toNeoneFormat<T extends Record<string, unknown>>(
  ourFormat: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const className = typeof ourFormat['@type'] === 'string' ? ourFormat['@type'] : ''

  for (const [k, v] of Object.entries(ourFormat)) {
    if (k === '@id') continue // server assigns its own
    if (k === '@context') {
      if (typeof v === 'string') {
        out['@context'] = { '@vocab': v.endsWith('#') ? v : `${v}#` }
      } else {
        out['@context'] = v
      }
      continue
    }
    if (k === '@type') {
      out['@type'] = typeof v === 'string' ? [v, 'LogisticsObject'] : v
      continue
    }
    if (UNIT_BEARING_FIELDS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = wrapUnitObject(v as Record<string, unknown>)
      continue
    }
    out[k] = wrapObjectPropertyValue(className, k, v)
  }
  return out
}

/**
 * Unwrap an `{ '@id': '...' }` ObjectProperty value back to its bare
 * string form by stripping the namespace prefix. Returns the value
 * unchanged if it doesn't match a known wrapping shape.
 */
function unwrapObjectProperty(value: unknown): unknown {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    '@id' in value &&
    Object.keys(value).length === 1
  ) {
    const id = (value as { '@id': string })['@id']
    if (typeof id !== 'string') return value
    const hashIdx = id.lastIndexOf('#')
    if (hashIdx >= 0) return id.slice(hashIdx + 1)
    return id
  }
  return value
}

/**
 * Unwrap an xsd-typed literal `{ '@type': xsd:..., '@value': '...' }`
 * back to a JS primitive. Numbers come back as numbers; everything else
 * stays as the string value.
 */
function unwrapXsdLiteral(value: unknown): unknown {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    '@type' in value &&
    '@value' in value
  ) {
    const t = (value as { '@type': string })['@type']
    const v = (value as { '@value': string })['@value']
    if (typeof v !== 'string') return value
    if (
      typeof t === 'string' &&
      (t.endsWith('#double') ||
        t.endsWith('#float') ||
        t.endsWith('#decimal') ||
        t.endsWith('#integer'))
    ) {
      const n = Number(v)
      return Number.isFinite(n) ? n : value
    }
    return v
  }
  return value
}

/**
 * Recursively unwrap fields inside a unit-bearing sub-object.
 */
function unwrapUnitObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'unit') out[k] = unwrapObjectProperty(v)
    else if (k === 'value') out[k] = unwrapXsdLiteral(v)
    else out[k] = v
  }
  return out
}

/**
 * Convert NE:ONE JSON-LD back into the envelope shape our 3.2 lib's
 * deserializers expect. Reverses `toNeoneFormat`. Also handles
 * `@graph`-wrapped responses by extracting the root resource matching
 * the requested IRI; nested resources (e.g. weight values) referenced
 * by `{ '@id': '...' }` from the root are inlined back into the root.
 */
export function fromNeoneFormat(
  neoneFormat: Record<string, unknown>,
  rootIri?: string,
): Record<string, unknown> {
  // Step 1: if the response is @graph-wrapped, extract the root resource.
  let body = neoneFormat
  let nestedById: Map<string, Record<string, unknown>> | undefined
  if (Array.isArray(neoneFormat['@graph'])) {
    const graph = neoneFormat['@graph'] as Array<Record<string, unknown>>
    nestedById = new Map()
    for (const node of graph) {
      const id = typeof node['@id'] === 'string' ? node['@id'] : undefined
      if (id) nestedById.set(id, node)
    }
    let root: Record<string, unknown> | undefined
    if (rootIri && nestedById.has(rootIri)) {
      root = nestedById.get(rootIri)
    } else {
      // Fallback: pick the first node whose @type includes 'LogisticsObject'.
      root = graph.find(
        (n) => Array.isArray(n['@type']) && (n['@type'] as unknown[]).includes('LogisticsObject'),
      )
    }
    if (!root) throw new Error('fromNeoneFormat: cannot find root in @graph response')
    body = root
    // Carry @context onto root so downstream gets the original context object.
    if ('@context' in neoneFormat) body['@context'] = neoneFormat['@context']
  }

  // Step 2: unwrap envelope (@context object → string, @type array → literal).
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (k === '@context' && typeof v === 'object' && v !== null && '@vocab' in v) {
      const vocab = (v as { '@vocab': string })['@vocab']
      out[k] = typeof vocab === 'string' && vocab.endsWith('#') ? vocab.slice(0, -1) : vocab
      continue
    }
    if (k === '@type' && Array.isArray(v)) {
      const cargoTypes = v.filter((t) => t !== 'LogisticsObject')
      out[k] = cargoTypes.length === 1 ? cargoTypes[0] : cargoTypes
      continue
    }
    if (UNIT_BEARING_FIELDS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
      // Two cases: (a) inline {unit, value} object — unwrap directly;
      // (b) {@id} reference into nestedById — resolve, then unwrap.
      if ('@id' in v && nestedById) {
        const refId = (v as { '@id': string })['@id']
        const resolved = nestedById.get(refId)
        out[k] = resolved ? unwrapUnitObject(resolved) : v
      } else {
        out[k] = unwrapUnitObject(v as Record<string, unknown>)
      }
      continue
    }
    // Default: try ObjectProperty unwrap (turns {@id} → bare string),
    // then xsd-literal unwrap (turns {@type, @value} → JS primitive).
    out[k] = unwrapXsdLiteral(unwrapObjectProperty(v))
  }
  // Strip @id from nested unit-bearing entries that came from @graph
  // (they had a neone:* @id that's not meaningful in the parent's view).
  for (const k of UNIT_BEARING_FIELDS) {
    if (
      out[k] &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k]) &&
      '@id' in (out[k] as object)
    ) {
      const { '@id': _ignored, ...rest } = out[k] as Record<string, unknown>
      out[k] = rest
    }
  }
  return out
}

export interface PostResult {
  /** Server-assigned IRI for the new logistics object. */
  iri: string
  /** Server response status code (typically 201). */
  status: number
}

/**
 * POST a logistics object to NE:ONE. Auto-applies envelope adapter.
 * Returns the server-assigned IRI from the Location header.
 */
export async function postLogisticsObject(ourFormat: Record<string, unknown>): Promise<PostResult> {
  const token = await getNeoneToken()
  const wire = toNeoneFormat(ourFormat)
  const res = await fetch(`${NEONE_URL}/logistics-objects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ld+json',
      Accept: 'application/ld+json',
    },
    body: JSON.stringify(wire),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `NE:ONE POST /logistics-objects failed: ${res.status} ${res.statusText}\n${text}`,
    )
  }
  const iri = res.headers.get('location')
  if (!iri) {
    throw new Error('NE:ONE POST succeeded but no Location header returned')
  }
  return { iri, status: res.status }
}

/**
 * GET a logistics object from NE:ONE by its IRI. Auto-applies inverse
 * envelope adapter so the returned object is in our 3.2 lib's shape
 * (ready for our deserializers).
 */
export async function getLogisticsObject(iri: string): Promise<Record<string, unknown>> {
  const token = await getNeoneToken()
  const res = await fetch(iri, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/ld+json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`NE:ONE GET ${iri} failed: ${res.status} ${res.statusText}\n${text}`)
  }
  const neoneShape = (await res.json()) as Record<string, unknown>
  return fromNeoneFormat(neoneShape, iri)
}

/**
 * Probe whether the local NE:ONE stack is reachable. Used in vitest
 * `beforeAll` to skip contract tests cleanly when the stack is down.
 */
export async function neoneReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${NEONE_URL}/q/health`, {
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}
