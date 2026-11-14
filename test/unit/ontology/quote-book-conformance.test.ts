/**
 * Quote & Book ontology conformance guard (v0.6.0 spec §9.3).
 *
 * Mechanically diffs the Zod schemas of the six Quote & Book LogisticsObject
 * classes and the nine embedded shapes against IATA's vendored ontology files
 * (`test/fixtures/ontology/iata-onerecord/`), so that drift on either side fails
 * CI. The numbered describe blocks are spec §9.3 steps (1)–(8); the other
 * blocks harden them (v0.6.0 implementation plan, Task 12). A failure here
 * means a schema and the ontology disagree: fix the schema or record a
 * deviation, never loosen the guard silently.
 *
 * Every ontology fact is extracted once, at module load, by
 * `test/util/ontology-extract.ts`.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { BookingOptionSchema } from '../../../src/classes/booking-option/schema.js'
import { BookingRequestSchema } from '../../../src/classes/booking-request/schema.js'
import { BookingSchema } from '../../../src/classes/booking/schema.js'
import { OtherChargeSchema } from '../../../src/classes/other-charge/schema.js'
import { PriceSchema } from '../../../src/classes/price/schema.js'
import { RatingsSchema } from '../../../src/classes/ratings/schema.js'
import {
  ActivitySequenceSchema,
  CarrierProductSchema,
  ContactDetailSchema,
  EmbeddedBookingSegmentSchema,
  EmbeddedBookingTimesSchema,
  PieceGroupSchema,
  RangesSchema,
  StationRemarksSchema,
  UnitsPreferenceSchema,
  XSD_DURATION,
} from '../../../src/classes/shared/distribution.js'
import {
  CurrencyValueSchema,
  OtherIdentifierSchema,
  ValueSchema,
} from '../../../src/classes/shared/value.js'
import { TransportLegsSchema } from '../../../src/classes/transport-legs/schema.js'
import { TransportMovementSchema } from '../../../src/classes/transport-movement/schema.js'
import { WaybillLineItemSchema } from '../../../src/classes/waybill-line-item/schema.js'
import { WaybillSchema } from '../../../src/classes/waybill/schema.js'
import {
  BookingOptionStatus,
  BookingStatus,
  ChargeIdentifier,
  EntitlementCode,
  PrepaidCollectIndicator,
  SpaceAllocationCode,
  TransportMeansServiceType,
} from '../../../src/codes/enums.js'
import { FIELD_TYPES } from '../../../src/dispatch/field-types.js'
import { __VERSION__ } from '../../../src/version.js'
import { envelope } from '../../factories/common.js'
import {
  type ExtractedClass,
  type ExtractedProperty,
  VENDORED_SHA256,
  extractClasses,
  extractOneOf,
  readVendored,
  sha256Lf,
} from '../../util/ontology-extract.js'

// ---------------------------------------------------------------------------
// Scope: each schema keyed by its ontology class name

type ObjectSchema = z.ZodObject
/** Zod core type: what `ZodOptional.unwrap()` and `ZodArray.element` return. */
type Schema = z.core.$ZodType

const LO = {
  Price: PriceSchema,
  Ratings: RatingsSchema,
  TransportLegs: TransportLegsSchema,
  BookingOption: BookingOptionSchema,
  BookingRequest: BookingRequestSchema,
  Booking: BookingSchema,
} satisfies Record<string, ObjectSchema>

const EMB = {
  Ranges: RangesSchema,
  UnitsPreference: UnitsPreferenceSchema,
  CarrierProduct: CarrierProductSchema,
  StationRemarks: StationRemarksSchema,
  BookingTimes: EmbeddedBookingTimesSchema,
  PieceGroup: PieceGroupSchema,
  BookingSegment: EmbeddedBookingSegmentSchema,
  ActivitySequence: ActivitySequenceSchema,
  ContactDetail: ContactDetailSchema,
} satisfies Record<string, ObjectSchema>

/** Precedent schemas: spec §9.3 step 6 and the §2.2 "Same as" column. */
const PRECEDENTS = {
  Waybill: WaybillSchema,
  OtherCharge: OtherChargeSchema,
  WaybillLineItem: WaybillLineItemSchema,
  CurrencyValue: CurrencyValueSchema,
  TransportMovement: TransportMovementSchema,
  OtherIdentifier: OtherIdentifierSchema,
} satisfies Record<string, ObjectSchema>

const LO_NAMES = Object.keys(LO)
const EMB_NAMES = Object.keys(EMB)
const SCOPE: Readonly<Record<string, ObjectSchema>> = { ...LO, ...EMB }
const ALL_NAMES = Object.keys(SCOPE)
const SCHEMAS: Readonly<Record<string, ObjectSchema>> = { ...SCOPE, ...PRECEDENTS }

/** An embedded range resolves to the schema itself: the inverse of EMB, plus `:Value`. */
const SCHEMA_FOR_RANGE: Readonly<Record<string, Schema>> = { ...EMB, Value: ValueSchema }

const ENVELOPE: ReadonlySet<string> = new Set(['@context', '@type', '@id'])

// ---------------------------------------------------------------------------
// Declared once (spec §9.3)

interface LegacyKey {
  key: string
  deviation: number
  removeBy: string
}

const LEGACY: Readonly<Record<string, readonly LegacyKey[]>> = {
  BookingOption: [
    { key: 'optionStatus', deviation: 18, removeBy: '0.8.0' },
    { key: 'expiresAt', deviation: 18, removeBy: '0.8.0' },
    { key: 'preferences', deviation: 18, removeBy: '0.8.0' },
  ],
  BookingRequest: [
    { key: 'requestStatus', deviation: 18, removeBy: '0.8.0' },
    { key: 'requestor', deviation: 18, removeBy: '0.8.0' },
    { key: 'preferences', deviation: 18, removeBy: '0.8.0' },
  ],
  Booking: [
    { key: 'forBookingRequest', deviation: 18, removeBy: '0.8.0' },
    { key: 'forBookingOption', deviation: 18, removeBy: '0.8.0' },
  ],
}
const LOGISTICS_OBJECT_LEVEL = ['checks', 'events', 'externalReferences', 'skeletonIndicator'] // deviation #19

// ---------------------------------------------------------------------------
// Declared allowances. Each is checked to be live, so a stale entry fails.

/** The seven spec §2.3 closed lists, keyed by ontology range. */
const CLOSED_LISTS: Readonly<Record<string, z.ZodEnum>> = {
  ':BookingStatus': BookingStatus,
  ':BookingOptionStatus': BookingOptionStatus,
  'codes:ChargeIdentifier': ChargeIdentifier,
  'codes:PrepaidCollectIndicator': PrepaidCollectIndicator,
  'codes:EntitlementCode': EntitlementCode,
  'codes:SpaceAllocationCode': SpaceAllocationCode,
  'codes:TransportMeansServiceType': TransportMeansServiceType,
}

/** The single declared exception to the closed-list check: two legacy values (spec §5.3). */
const CLOSED_LIST_EXTRA: Readonly<Record<string, readonly string[]>> = {
  'Booking.bookingStatus': ['REQUEST_ACCEPTED', 'REQUEST_REVOKED'],
}

/** Spec §6: FIELD_TYPES entries that deliberately differ from the ontology range. */
const FIELD_TYPE_SUBSTITUTIONS: Readonly<Record<string, string>> = {
  'BookingOption.carrier': '*',
  'Booking.carrier': '*',
  'Booking.contactPersons': 'Person',
}

/** Spec §6: iri-kind properties deliberately absent from FIELD_TYPES. */
const FIELD_TYPE_NOT_MAPPED: ReadonlySet<string> = new Set([
  'TransportLegs.operatingTransportMeans',
])

/** Spec §2.2: the only xsd:string properties encoded with a regex (as on Waybill). */
const WAYBILL_REGEX_PROPERTIES: ReadonlySet<string> = new Set(['waybillPrefix', 'waybillNumber'])

/** Spec §5.1 [L]: a legacy datetime key, checked with the eight ontology datetimes (nine in all). */
const LEGACY_DATETIME = ['BookingOption.expiresAt']

/** Spec §9.3 step 6: the precedent fields grouped with the new code-kind fields. */
const STEP6_PRECEDENTS = [
  'Waybill.carrierChargeCode',
  'OtherCharge.otherChargeCode',
  'OtherCharge.chargePaymentType',
  'OtherCharge.entitlement',
  'WaybillLineItem.rcp',
  'WaybillLineItem.rateClassCode',
  'WaybillLineItem.uldRateClassType',
  'CurrencyValue.currencyUnit',
]

/** A §2.2 encoding: a named enum, or a string with these bounds or this regex. */
interface StringEncoding {
  minLength: number | null
  maxLength: number | null
  pattern?: RegExp
}
type Encoding = 'enum' | StringEncoding

const str = (minLength: number | null, maxLength: number | null): StringEncoding => ({
  minLength,
  maxLength,
})

/** Spec §9.3 step 6 groups, each with its exact membership and its §2.2 encoding. */
const CODE_GROUPS: Readonly<Record<string, { encoding: Encoding; members: string[] }>> = {
  'codes:ChargeCode': {
    encoding: str(1, 16),
    members: ['Price.chargeCode', 'Waybill.carrierChargeCode'],
  },
  'codes:OtherChargeCode': {
    encoding: str(1, 16),
    members: ['Ratings.otherChargeCode', 'OtherCharge.otherChargeCode'],
  },
  'codes:PrepaidCollectIndicator': {
    encoding: 'enum',
    members: ['Ratings.chargePaymentType', 'OtherCharge.chargePaymentType'],
  },
  'codes:EntitlementCode': {
    encoding: 'enum',
    members: ['Ratings.entitlement', 'OtherCharge.entitlement'],
  },
  'codes:RateClassCode': {
    encoding: str(1, 8),
    members: ['Ranges.rateClassCode', 'WaybillLineItem.rateClassCode'],
  },
  ':CodeListElement': {
    encoding: str(1, 16),
    members: [
      'Ratings.rcp',
      'TransportLegs.transportMeansType',
      'Ranges.uldRateClassType',
      'CarrierProduct.productCode',
      'CarrierProduct.serviceLevelCode',
      'WaybillLineItem.rcp',
      'WaybillLineItem.uldRateClassType',
    ],
  },
  ':ContactDetailType': { encoding: str(1, 64), members: ['ContactDetail.contactDetailType'] },
  'codes:CurrencyCode': {
    encoding: str(1, null),
    members: ['UnitsPreference.currency', 'CurrencyValue.currencyUnit'],
  },
  'codes:DimensionsUnitCode': {
    encoding: str(1, null),
    members: ['UnitsPreference.dimensionsUnit'],
  },
  'codes:TemperatureUnitCode': {
    encoding: str(1, null),
    members: ['UnitsPreference.temperatureUnit'],
  },
  'codes:VolumeUnitCode': { encoding: str(1, null), members: ['UnitsPreference.volumeUnit'] },
  'codes:WeightUnitCode': { encoding: str(1, null), members: ['UnitsPreference.weightUnit'] },
  'codes:ChargeIdentifier': {
    encoding: 'enum',
    members: ['Ratings.billingChargeIdentifier', 'Ratings.chargeType'],
  },
  'codes:SpaceAllocationCode': {
    encoding: 'enum',
    members: ['BookingSegment.spaceAllocationCode'],
  },
  'codes:TransportMeansServiceType': {
    encoding: 'enum',
    members: ['TransportLegs.transportMeansServiceType'],
  },
  ':BookingStatus': { encoding: 'enum', members: ['Booking.bookingStatus'] },
  ':BookingOptionStatus': { encoding: 'enum', members: ['BookingOption.statusBookingOption'] },
}

/**
 * Spec §2.2 rows for xsd:string properties, each with its "Same as" precedent.
 * Not a §9.3 step: it extends step 6's mechanism to the free-text bounds, which
 * no other check pins.
 */
const STRING_GROUPS: Readonly<Record<string, { encoding: StringEncoding; members: string[] }>> = {
  'free text, identifiers': {
    encoding: str(1, 64),
    members: [
      'Ratings.priceReferenceId',
      'Ratings.priceSpecification',
      'Ranges.unitBasis',
      'Booking.shippingRefNo',
      'BookingSegment.allotmentCode',
      'ActivitySequence.sequenceNumber',
      'Waybill.shippingRefNo',
    ],
  },
  'free text, descriptions': {
    encoding: str(1, 256),
    members: [
      'Ratings.chargeDescription',
      'CarrierProduct.productDescription',
      'OtherCharge.reasonDescription',
    ],
  },
  'free text, long': {
    encoding: str(1, 512),
    members: [
      'BookingOption.additionalInformation',
      'BookingOption.alternatives',
      'Booking.additionalInformation',
      'Booking.shippingInfo',
      'StationRemarks.remarksText',
      'Waybill.accountingInformation',
    ],
  },
  ':transportIdentifier': {
    encoding: str(null, 17),
    members: ['TransportLegs.transportIdentifier', 'TransportMovement.transportIdentifier'],
  },
  ':textualValue': {
    encoding: str(1, null),
    members: ['ContactDetail.textualValue', 'OtherIdentifier.textualValue'],
  },
  ':waybillPrefix': {
    encoding: { minLength: null, maxLength: null, pattern: /^[A-Z0-9]{1,3}$/ },
    members: ['BookingRequest.waybillPrefix', 'Booking.waybillPrefix', 'Waybill.waybillPrefix'],
  },
  ':waybillNumber': {
    encoding: { minLength: null, maxLength: null, pattern: /^[A-Z0-9]+$/ },
    members: ['BookingRequest.waybillNumber', 'Booking.waybillNumber', 'Waybill.waybillNumber'],
  },
}

// ---------------------------------------------------------------------------
// Ontology facts, extracted once

const DM32 = '2025-07-standard/IATA-1R-DM-Ontology.ttl'
const CL32 = '2025-07-standard/IATA-1R-CL-Ontology.ttl'
const DM33 = '2026-07-standard/IATA-1R-DM-Ontology.ttl'
const dm32 = readVendored(DM32)
const cl32 = readVendored(CL32)
const dm33 = readVendored(DM33)
const TTL: Readonly<Record<string, string>> = { [DM32]: dm32, [CL32]: cl32, [DM33]: dm33 }

const ONTO_32 = extractClasses(dm32, [...ALL_NAMES, ...Object.keys(PRECEDENTS)], {
  inherit: 'intermediate',
})
const ONTO_33 = extractClasses(dm33, ALL_NAMES, { inherit: 'intermediate' })

/** `:X` → `X`; `codes:X` → `X`. */
function localName(range: string): string {
  const name = /^(?:codes)?:(\w+)$/.exec(range)?.[1]
  if (name === undefined) throw new Error(`guard: ${range} is not a :name or codes:name range`)
  return name
}

/** `codes:X` enumerations live in the CL file, `:X` ones in the DM file. */
const ONE_OF: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.keys(CLOSED_LISTS).map((range) => [
    range,
    extractOneOf(range.startsWith('codes:') ? cl32 : dm32, localName(range)),
  ]),
)

function classOf(extracted: Record<string, ExtractedClass>, name: string): ExtractedClass {
  const cls = extracted[name]
  if (cls === undefined) throw new Error(`guard: ${name} was not extracted`)
  return cls
}

function ontoOf(cls: string): string[] {
  return Object.keys(classOf(ONTO_32, cls).properties)
}

// ---------------------------------------------------------------------------
// Schema introspection

function shapeOf(cls: string): Readonly<Record<string, Schema>> {
  const schema = SCHEMAS[cls]
  if (schema === undefined) throw new Error(`guard: no schema for ${cls}`)
  return schema.shape
}

function fieldOf(cls: string, key: string): Schema {
  const field = shapeOf(cls)[key]
  if (field === undefined) throw new Error(`guard: ${cls} has no key ${key}`)
  return field
}

/** Shape keys minus the JSON-LD envelope. */
function keysOf(cls: string): string[] {
  return Object.keys(shapeOf(cls)).filter((key) => !ENVELOPE.has(key))
}

function legacyKeysOf(cls: string): string[] {
  return (LEGACY[cls] ?? []).map(({ key }) => key)
}

function unwrap(schema: Schema): Schema {
  let inner = schema
  while (inner instanceof z.ZodOptional) inner = inner.unwrap()
  return inner
}

function elem(schema: Schema): Schema {
  return schema instanceof z.ZodArray ? schema.element : schema
}

/**
 * Regex sources of a string schema's checks, read from each check's own
 * definition. zod 4.6 stopped filling the derived `_zod.bag.patterns` cache at
 * construction, so the cache cannot be relied on. The `guard helpers` canary
 * fails loudly if zod moves this again.
 */
function patternsOf(schema: z.ZodString): string[] {
  return (schema._zod.def.checks ?? [])
    .map((check) => (check._zod.def as { pattern?: unknown }).pattern)
    .filter((pattern): pattern is RegExp => pattern instanceof RegExp)
    .map((pattern) => pattern.source)
    .sort()
}

interface Descriptor {
  type: string
  options: string[] | null
  format: string | null
  minLength: number | null
  maxLength: number | null
  patterns: string[]
}

/** Spec §9.3 step 6 `{ type, options, minLength, maxLength }`, plus `format` and regex sources. */
function describeType(schema: Schema): Descriptor {
  const none = { options: null, format: null, minLength: null, maxLength: null, patterns: [] }
  if (schema instanceof z.ZodEnum) {
    return { ...none, type: 'enum', options: schema.options.map(String).sort() }
  }
  if (schema instanceof z.ZodString) {
    return {
      type: 'string',
      options: null,
      format: schema.format,
      minLength: schema.minLength,
      maxLength: schema.maxLength,
      patterns: patternsOf(schema),
    }
  }
  return { ...none, type: schema.constructor.name }
}

function encodingDescriptor(encoding: StringEncoding): Descriptor {
  const { minLength, maxLength, pattern } = encoding
  return {
    type: 'string',
    options: null,
    format: pattern === undefined ? null : 'regex',
    minLength,
    maxLength,
    patterns: pattern === undefined ? [] : [pattern.source],
  }
}

// ---------------------------------------------------------------------------
// The fields under test: keys ∩ onto, for every class in scope

interface Field {
  id: string
  cls: string
  key: string
  prop: ExtractedProperty
  /** The shape value as declared. */
  field: Schema
  /** `elem(unwrap(field))`: what every kind check runs on. */
  el: Schema
}

const FIELDS: Field[] = ALL_NAMES.flatMap((cls) =>
  Object.entries(classOf(ONTO_32, cls).properties)
    .filter(([key]) => Object.hasOwn(shapeOf(cls), key))
    .map(([key, prop]) => {
      const field = fieldOf(cls, key)
      return { id: `${cls}.${key}`, cls, key, prop, field, el: elem(unwrap(field)) }
    }),
)

const ofKind = (kind: ExtractedProperty['kind']): Field[] =>
  FIELDS.filter(({ prop }) => prop.kind === kind)
const ofRange = (range: string): Field[] =>
  FIELDS.filter(({ prop }) => prop.kind === 'literal' && prop.range === range)

const CLOSED_FIELDS = ofKind('code').filter(({ prop }) => Object.hasOwn(CLOSED_LISTS, prop.range))

const DATETIME_FIELDS = [
  ...ofRange('xsd:dateTime').map(({ id, el }) => ({ id, el })),
  ...LEGACY_DATETIME.map((id) => {
    const [cls = '', key = ''] = id.split('.')
    return { id, el: elem(unwrap(fieldOf(cls, key))) }
  }),
]

const LITERAL_RANGES = [
  'xsd:dateTime',
  'xsd:double',
  'xsd:integer',
  'xsd:boolean',
  'xsd:duration',
  'xsd:string',
]

/** Any `Class.key` in SCHEMAS: its ontology property and its unwrapped element schema. */
function member(id: string): { prop: ExtractedProperty; el: Schema } {
  const [cls = '', key = ''] = id.split('.')
  const prop = classOf(ONTO_32, cls).properties[key]
  if (prop === undefined) throw new Error(`guard: ${id} is not an ontology property`)
  return { prop, el: elem(unwrap(fieldOf(cls, key))) }
}

const sorted = (values: Iterable<string>): string[] => [...values].sort()

function groupMembership(ids: readonly string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const id of ids) {
    const { range } = member(id).prop
    groups[range] = sorted([...(groups[range] ?? []), id])
  }
  return groups
}

// ---------------------------------------------------------------------------
// LEGACY hygiene helpers

const LEGACY_ROWS = Object.entries(LEGACY).flatMap(([cls, keys]) =>
  keys.map((legacy) => ({ id: `${cls}.${legacy.key}`, cls, ...legacy })),
)

function schemaSource(cls: string): string {
  const dir = cls.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  return readFileSync(join(process.cwd(), 'src/classes', dir, 'schema.ts'), 'utf8')
}

/**
 * The declarations of `key` (matches of `/(^|\*\/)\s*KEY\??\s*:/m`) whose
 * preceding trimmed text ends with a single `/** … *\/` block that contains
 * `@deprecated`. `ownLine` is false when that block sits on the key's line.
 */
function deprecatedJsDocs(source: string, key: string): { ownLine: boolean }[] {
  const found: { ownLine: boolean }[] = []
  for (const match of source.matchAll(new RegExp(String.raw`(^|\*\/)\s*${key}\??\s*:`, 'gm'))) {
    const anchor = match[1] ?? ''
    const before = source.slice(0, match.index + anchor.length).trimEnd()
    if (!before.endsWith('*/')) continue
    const block = before.slice(before.lastIndexOf('/**'))
    if (!block.startsWith('/**') || block.indexOf('*/') !== block.length - 2) continue
    if (!block.includes('@deprecated')) continue
    found.push({ ownLine: anchor === '' || match[0].includes('\n') })
  }
  return found
}

function deprecatedJsDocCount(source: string, key: string): number {
  return deprecatedJsDocs(source, key).length
}

/** Semver precedence for `x.y.z` and `x.y.z-pre`: negative, zero or positive. */
function compareSemver(a: string, b: string): number {
  const parse = (version: string) => {
    const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(version)
    if (m === null) throw new Error(`guard: ${version} is not semver`)
    return { core: [Number(m[1]), Number(m[2]), Number(m[3])], pre: m[4] }
  }
  const x = parse(a)
  const y = parse(b)
  for (let i = 0; i < 3; i++) {
    const diff = (x.core[i] ?? 0) - (y.core[i] ?? 0)
    if (diff !== 0) return diff
  }
  if (x.pre === y.pre) return 0
  if (x.pre === undefined) return 1
  if (y.pre === undefined) return -1
  return x.pre < y.pre ? -1 : 1
}

const DEVIATIONS = readFileSync(join(process.cwd(), 'docs/spec-deviations.md'), 'utf8').replace(
  /\r\n/g,
  '\n',
)

/** The text of `## N. …` up to the next `## ` heading, or undefined. */
function deviationSection(n: number): string | undefined {
  const start = DEVIATIONS.search(new RegExp(`^## ${n}\\. `, 'm'))
  if (start === -1) return undefined
  const rest = DEVIATIONS.slice(start + 1)
  const end = rest.search(/^## /m)
  return end === -1 ? DEVIATIONS.slice(start) : DEVIATIONS.slice(start, start + 1 + end)
}

// ===========================================================================

describe('guard helpers', () => {
  it('deprecatedJsDocCount counts only @deprecated JSDoc blocks directly before the key', () => {
    const source = [
      'const S = z.object({',
      '  /** @deprecated Gone. */',
      '  a: z.string().optional(),',
      '  /** Not deprecated. */',
      '  b: z.string().optional(),',
      '  // @deprecated in a line comment',
      '  c: z.string().optional(),',
      '  /** @deprecated Same line. */ d: z.string().optional(),',
      '})',
      'type T = {',
      '  /**',
      '   * @deprecated Multi-line.',
      '   */',
      '  a?: string',
      '}',
    ].join('\n')
    expect(deprecatedJsDocCount(source, 'a')).toBe(2)
    expect(deprecatedJsDocs(source, 'a').every(({ ownLine }) => ownLine)).toBe(true)
    expect(deprecatedJsDocCount(source, 'b')).toBe(0)
    expect(deprecatedJsDocCount(source, 'c')).toBe(0)
    expect(deprecatedJsDocs(source, 'd')).toEqual([{ ownLine: false }])
  })

  it('compareSemver orders numerically, pre-releases first', () => {
    expect(compareSemver('0.6.0', '0.8.0')).toBeLessThan(0)
    expect(compareSemver('0.8.0', '0.8.0')).toBe(0)
    expect(compareSemver('0.10.0', '0.8.0')).toBeGreaterThan(0)
    expect(compareSemver('0.8.0-rc', '0.8.0')).toBeLessThan(0)
    expect(compareSemver('1.0.0', '0.8.0')).toBeGreaterThan(0)
  })

  it('patternsOf reads regex sources from zod string checks (canary for zod internals)', () => {
    expect(patternsOf(z.string().regex(/^b/).regex(/^a$/))).toEqual(['^a$', '^b'])
    expect(patternsOf(z.string().regex(XSD_DURATION))).toEqual([XSD_DURATION.source])
    expect(patternsOf(z.string().min(1).max(3))).toEqual([])
  })
})

describe('scope', () => {
  it('is exactly 6 LogisticsObject classes and 9 embedded shapes', () => {
    expect(LO_NAMES).toHaveLength(6)
    expect(EMB_NAMES).toHaveLength(9)
    expect(new Set(ALL_NAMES).size).toBe(15)
    expect(Object.keys(LEGACY).filter((cls) => !LO_NAMES.includes(cls))).toEqual([])
  })

  it.each(ALL_NAMES)('%s: @type is the literal ontology class name', (cls) => {
    const type = unwrap(fieldOf(cls, '@type'))
    expect(type).toBeInstanceOf(z.ZodLiteral)
    expect(type instanceof z.ZodLiteral && type.value).toBe(cls)
  })

  it.each(EMB_NAMES)('%s: @type is optional and there is no @id or @context', (cls) => {
    expect(fieldOf(cls, '@type')).toBeInstanceOf(z.ZodOptional)
    expect(Object.keys(shapeOf(cls)).filter((key) => key === '@id' || key === '@context')).toEqual(
      [],
    )
  })

  it.each(ALL_NAMES)('%s: every non-envelope key is optional', (cls) => {
    const required = keysOf(cls).filter((key) => !(fieldOf(cls, key) instanceof z.ZodOptional))
    expect(required).toEqual([])
  })

  it.each(LO_NAMES)('%s: the envelope alone parses', (cls) => {
    const result = SCOPE[cls]?.safeParse(envelope(cls))
    expect(result?.error?.issues).toBeUndefined()
    expect(result?.success).toBe(true)
  })
})

describe('(1) vendored files', () => {
  const readme = readVendored('README.md')
  const pins: Record<string, string> = {}
  for (const m of readme.matchAll(/^\| `([^`]+\.ttl)` \|.*\| `([0-9a-f]{64})` \|$/gm)) {
    const [, path, hash] = m
    if (path !== undefined && hash !== undefined) pins[path] = hash
  }

  it('the README pins exactly the three vendored TTL files, as VENDORED_SHA256 does', () => {
    expect(sorted(Object.keys(pins))).toEqual(sorted(Object.keys(TTL)))
    expect(pins).toEqual(VENDORED_SHA256)
  })

  it.each(Object.keys(TTL))('%s matches its README sha256Lf pin', (path) => {
    expect(sha256Lf(TTL[path] ?? '')).toBe(pins[path])
  })
})

describe('(2) :LogisticsObject-level properties', () => {
  it('the own properties of :LogisticsObject are LOGISTICS_OBJECT_LEVEL', () => {
    const own = classOf(extractClasses(dm32, ['LogisticsObject']), 'LogisticsObject')
    expect(sorted(Object.keys(own.properties))).toEqual(sorted(LOGISTICS_OBJECT_LEVEL))
  })
})

describe('(3) key sets', () => {
  it.each(ALL_NAMES)('%s: onto ⊆ keys', (cls) => {
    const keys = new Set(keysOf(cls))
    expect(ontoOf(cls).filter((property) => !keys.has(property))).toEqual([])
  })

  it.each(ALL_NAMES)('%s: keys ⊆ onto ∪ LEGACY', (cls) => {
    const allowed = new Set([...ontoOf(cls), ...legacyKeysOf(cls)])
    expect(keysOf(cls).filter((key) => !allowed.has(key))).toEqual([])
  })

  it.each(ALL_NAMES)('%s: LEGACY ∩ onto = ∅', (cls) => {
    const onto = new Set(ontoOf(cls))
    expect(legacyKeysOf(cls).filter((key) => onto.has(key))).toEqual([])
  })

  it.each(ALL_NAMES)('%s: LOGISTICS_OBJECT_LEVEL ∩ keys = ∅', (cls) => {
    const keys = new Set(keysOf(cls))
    expect(LOGISTICS_OBJECT_LEVEL.filter((property) => keys.has(property))).toEqual([])
  })
})

describe('(4) LEGACY hygiene', () => {
  it.each(LEGACY_ROWS)('$id is optional', ({ cls, key }) => {
    expect(fieldOf(cls, key)).toBeInstanceOf(z.ZodOptional)
  })

  it.each(LEGACY_ROWS)(
    '$id has own-line @deprecated JSDoc in the schema and in the hand-written type',
    ({ cls, key }) => {
      const source = schemaSource(cls)
      expect(deprecatedJsDocCount(source, key)).toBe(2)
      expect(deprecatedJsDocs(source, key).filter(({ ownLine }) => !ownLine)).toEqual([])
    },
  )

  it.each(LEGACY_ROWS)(
    '$id is listed in deviation #$deviation with removeBy: $removeBy',
    ({ id, deviation, removeBy }) => {
      const section = deviationSection(deviation)
      expect(section, `docs/spec-deviations.md has no "## ${deviation}." heading`).toBeDefined()
      expect(section).toContain(`removeBy: ${removeBy}`)
      expect(section).toContain(`\`${id}\``)
    },
  )

  it('deviation #19 lists every LOGISTICS_OBJECT_LEVEL property', () => {
    const section = deviationSection(19)
    expect(section, 'docs/spec-deviations.md has no "## 19." heading').toBeDefined()
    for (const property of LOGISTICS_OBJECT_LEVEL) expect(section).toContain(`\`${property}\``)
  })

  it.each(LEGACY_ROWS)(
    'ratchet: $id must be removed before $removeBy',
    ({ id, removeBy, deviation }) => {
      expect(
        compareSemver(__VERSION__, removeBy),
        `__VERSION__ ${__VERSION__} has reached removeBy ${removeBy}: remove ${id} (deviation #${deviation})`,
      ).toBeLessThan(0)
    },
  )
})

describe('(5) shape and kind', () => {
  it('covers every kind and a known literal range for every literal field', () => {
    for (const kind of ['literal', 'code', 'iri', 'embedded'] as const) {
      expect(ofKind(kind).length, kind).toBeGreaterThan(0)
    }
    const unknown = ofKind('literal').filter(({ prop }) => !LITERAL_RANGES.includes(prop.range))
    expect(unknown.map(({ id, prop }) => `${id} ${prop.range}`)).toEqual([])
  })

  it.each(FIELDS)('$id: many ⇔ z.ZodArray', ({ prop, field }) => {
    expect(unwrap(field) instanceof z.ZodArray).toBe(prop.many)
  })

  it.each(ofKind('iri'))(
    'iri: $id accepts https and rejects javascript: as a safeIri issue',
    ({ el }) => {
      expect(z.safeParse(el, 'https://example.org/x').success).toBe(true)
      const rejected = z.safeParse(el, 'javascript:alert(1)')
      expect(rejected.success).toBe(false)
      expect(rejected.error?.issues).toContainEqual(
        expect.objectContaining({
          message: 'invalid_iri',
          params: expect.objectContaining({ __safe_iri__: true }),
        }),
      )
    },
  )

  it.each(ofKind('embedded'))('embedded identity: $id', ({ id, prop, el }) => {
    const expected = SCHEMA_FOR_RANGE[localName(prop.range)]
    expect(expected, `no schema for ${prop.range}`).toBeDefined()
    expect(el).toBeInstanceOf(z.ZodObject)
    expect(el === expected, `${id} must be the ${prop.range} schema itself`).toBe(true)
  })

  it.each(ofKind('code'))('code: $id is a z.ZodEnum or a z.ZodString', ({ el }) => {
    expect(el instanceof z.ZodEnum || el instanceof z.ZodString).toBe(true)
  })

  it.each(CLOSED_FIELDS)(
    'closed-list enum: $id equals the owl:oneOf of $prop.range',
    ({ id, prop, el }) => {
      expect(el).toBeInstanceOf(z.ZodEnum)
      if (!(el instanceof z.ZodEnum)) return
      const expected = [...(ONE_OF[prop.range] ?? []), ...(CLOSED_LIST_EXTRA[id] ?? [])]
      expect(new Set(el.options)).toEqual(new Set(expected))
    },
  )

  it('covers all nine datetime fields', () => {
    expect(DATETIME_FIELDS).toHaveLength(9)
  })

  it.each(DATETIME_FIELDS)('xsd:dateTime: $id requires a timezone', ({ el }) => {
    expect(el).toBeInstanceOf(z.ZodString)
    expect(el instanceof z.ZodString && el.format).toBe('datetime')
    expect(z.safeParse(el, '2026-11-20T10:00:00Z').success).toBe(true)
    expect(z.safeParse(el, '2026-11-20T10:00:00+02:00').success).toBe(true)
    expect(z.safeParse(el, '2026-11-20T10:00:00').success).toBe(false)
  })

  it.each(ofRange('xsd:double'))(
    'xsd:double: $id is an uncoerced, unbounded, non-integer z.ZodNumber',
    ({ el }) => {
      expect(el).toBeInstanceOf(z.ZodNumber)
      if (!(el instanceof z.ZodNumber)) return
      expect(el.def.coerce ?? false).toBe(false)
      expect(el.format).not.toBe('safeint')
      expect(el.minValue).toBe(Number.NEGATIVE_INFINITY)
      expect(el.maxValue).toBe(Number.POSITIVE_INFINITY)
    },
  )

  it.each(ofRange('xsd:integer'))(
    'xsd:integer: $id is an uncoerced safeint z.ZodNumber with no sign constraint',
    ({ el }) => {
      expect(el).toBeInstanceOf(z.ZodNumber)
      if (!(el instanceof z.ZodNumber)) return
      expect(el.def.coerce ?? false).toBe(false)
      expect(el.format).toBe('safeint')
      expect(el.minValue).toBe(Number.MIN_SAFE_INTEGER)
      expect(el.maxValue).toBe(Number.MAX_SAFE_INTEGER)
    },
  )

  it.each(ofRange('xsd:boolean'))('xsd:boolean: $id is a z.ZodBoolean', ({ el }) => {
    expect(el).toBeInstanceOf(z.ZodBoolean)
  })

  it.each(ofRange('xsd:duration'))('xsd:duration: $id is XSD_DURATION', ({ el }) => {
    expect(el).toBeInstanceOf(z.ZodString)
    if (!(el instanceof z.ZodString)) return
    expect(el.format).toBe('regex')
    expect(patternsOf(el)).toEqual([XSD_DURATION.source])
  })

  it.each(ofRange('xsd:string'))(
    'xsd:string: $id is a plain z.ZodString (waybill fields: a regex)',
    ({ key, el }) => {
      expect(el).toBeInstanceOf(z.ZodString)
      if (!(el instanceof z.ZodString)) return
      if (WAYBILL_REGEX_PROPERTIES.has(key)) {
        expect(el.format).toBe('regex')
      } else {
        expect(el.format).not.toBe('datetime')
        expect(el.format).not.toBe('regex')
      }
    },
  )
})

describe('(6) one type per range', () => {
  const codeIds = [...ofKind('code').map(({ id }) => id), ...STEP6_PRECEDENTS]

  it('the step-6 precedents are code-kind ontology properties', () => {
    const notCode = STEP6_PRECEDENTS.filter((id) => member(id).prop.kind !== 'code')
    expect(notCode).toEqual([])
  })

  it('each range groups exactly the declared fields', () => {
    const declared = Object.fromEntries(
      Object.entries(CODE_GROUPS).map(([range, { members }]) => [range, sorted(members)]),
    )
    expect(groupMembership(codeIds)).toEqual(declared)
  })

  it.each(Object.entries(CODE_GROUPS))(
    '%s: every member has the same type and the §2.2 encoding',
    (_range, { encoding, members }) => {
      const actual = Object.fromEntries(members.map((id) => [id, describeType(member(id).el)]))
      const first = actual[members[0] ?? '']
      const expected = encoding === 'enum' ? first : encodingDescriptor(encoding)
      if (encoding === 'enum') expect(first?.type).toBe('enum')
      expect(actual).toEqual(Object.fromEntries(members.map((id) => [id, expected])))
    },
  )
})

describe('§2.2 string encodings (extends step 6 to xsd:string)', () => {
  const declared = Object.values(STRING_GROUPS).flatMap(({ members }) => members)

  it('every xsd:string field in scope is in exactly one group, and every member is xsd:string', () => {
    const inScope = declared.filter((id) => Object.hasOwn(SCOPE, id.split('.')[0] ?? ''))
    expect(sorted(inScope)).toEqual(sorted(ofRange('xsd:string').map(({ id }) => id)))
    expect(new Set(declared).size).toBe(declared.length)
    expect(declared.filter((id) => member(id).prop.range !== 'xsd:string')).toEqual([])
  })

  it.each(Object.entries(STRING_GROUPS))(
    '%s: every member has the §2.2 encoding',
    (_row, { encoding, members }) => {
      const actual = Object.fromEntries(members.map((id) => [id, describeType(member(id).el)]))
      const expected = encodingDescriptor(encoding)
      expect(actual).toEqual(Object.fromEntries(members.map((id) => [id, expected])))
    },
  )
})

describe('(7) enum values', () => {
  it.each(Object.entries(CLOSED_LISTS))(
    '%s: the §2.3 enum equals the ontology owl:oneOf',
    (range, en) => {
      expect(new Set(en.options)).toEqual(new Set(ONE_OF[range]))
    },
  )
})

describe('FIELD_TYPES against the ontology', () => {
  const LO_IRI = LO_NAMES.flatMap((cls) =>
    Object.entries(classOf(ONTO_32, cls).properties)
      .filter(([, prop]) => prop.kind === 'iri')
      .map(([key, prop]) => ({ id: `${cls}.${key}`, range: prop.range })),
  )

  it.each(LO_IRI)('FIELD_TYPES[$id] matches the ontology range $range', ({ id, range }) => {
    const expected = FIELD_TYPE_NOT_MAPPED.has(id)
      ? undefined
      : (FIELD_TYPE_SUBSTITUTIONS[id] ?? localName(range))
    expect(FIELD_TYPES[id]).toBe(expected)
  })

  it('every declared allowance is live', () => {
    const iriIds = new Set(LO_IRI.map(({ id }) => id))
    const allowances = [...Object.keys(FIELD_TYPE_SUBSTITUTIONS), ...FIELD_TYPE_NOT_MAPPED]
    expect(allowances.filter((id) => !iriIds.has(id))).toEqual([])
    const closedIds = new Set(CLOSED_FIELDS.map(({ id }) => id))
    expect(Object.keys(CLOSED_LIST_EXTRA).filter((id) => !closedIds.has(id))).toEqual([])
  })

  it('has no entry for the six classes other than iri properties and legacy keys', () => {
    const allowed = new Set([...LO_IRI.map(({ id }) => id), ...LEGACY_ROWS.map(({ id }) => id)])
    const entries = Object.keys(FIELD_TYPES).filter((id) =>
      LO_NAMES.includes(id.split('.')[0] ?? ''),
    )
    expect(entries.filter((id) => !allowed.has(id))).toEqual([])
  })

  it('Waybill.referredBookingOption targets :Booking', () => {
    const prop = classOf(ONTO_32, 'Waybill').properties.referredBookingOption
    expect(prop).toMatchObject({ range: ':Booking', kind: 'iri' })
    expect(FIELD_TYPES['Waybill.referredBookingOption']).toBe('Booking')
  })
})

describe('(8) forward compatibility with 3.3.0', () => {
  const ignoringLines = ({ superclasses, properties }: ExtractedClass) => ({
    superclasses,
    properties: Object.fromEntries(
      Object.entries(properties).map(([key, { range, kind, many, from }]) => [
        key,
        { range, kind, many, from },
      ]),
    ),
  })

  it.each(ALL_NAMES)('%s: 3.2 and 3.3.0 extractions are equal, ignoring lines', (cls) => {
    expect(ignoringLines(classOf(ONTO_33, cls))).toEqual(ignoringLines(classOf(ONTO_32, cls)))
  })
})
