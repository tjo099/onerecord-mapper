import { describe, expect, it } from 'vitest'
import {
  type ExtractedClass,
  VENDORED_SHA256,
  extractClasses,
  extractOneOf,
  readVendored,
  sha256Lf,
} from '../../util/ontology-extract.js'

const DM32 = '2025-07-standard/IATA-1R-DM-Ontology.ttl'
const CL32 = '2025-07-standard/IATA-1R-CL-Ontology.ttl'
const DM33 = '2026-07-standard/IATA-1R-DM-Ontology.ttl'
const TTL_FILES = [DM32, CL32, DM33] as const

const dm32 = readVendored(DM32)
const cl32 = readVendored(CL32)
const dm33 = readVendored(DM33)

const sortedKeys = (o: object): string[] => Object.keys(o).sort()

function classOf(ttl: string, name: string, inherit: 'none' | 'intermediate' = 'none') {
  const cls = extractClasses(ttl, [name], { inherit })[name]
  if (cls === undefined) throw new Error(`test setup: ${name} missing from result`)
  return cls
}

/** 3.2 and 3.3.0 differ in line numbers, which spec §9.3 (8) ignores. */
function ignoringLines(classes: Record<string, ExtractedClass>) {
  return Object.fromEntries(
    Object.entries(classes).map(([name, { superclasses, properties }]) => [
      name,
      {
        superclasses,
        properties: Object.fromEntries(
          Object.entries(properties).map(([key, { range, kind, many, from }]) => [
            key,
            { range, kind, many, from },
          ]),
        ),
      },
    ]),
  )
}

function propertyOf(ttl: string, className: string, property: string) {
  const prop = classOf(ttl, className).properties[property]
  if (prop === undefined) throw new Error(`test setup: ${className}.${property} missing`)
  return prop
}

// Synthetic Turtle in the vendored files' layout, for rules the real files do not exercise.
const SYNTHETIC = [
  '@prefix : <https://onerecord.iata.org/ns/cargo#> .',
  '',
  ':LogisticsObject rdf:type owl:Class .',
  '',
  ':Base rdf:type owl:Class ;',
  '      rdfs:subClassOf [ rdf:type owl:Restriction ;',
  '                        owl:onProperty :baseCount ;',
  '                        owl:minCardinality "1"^^xsd:nonNegativeInteger',
  '                      ] .',
  '',
  ':Child rdf:type owl:Class ;',
  '       rdfs:subClassOf :Base ,',
  '                       [ rdf:type owl:Restriction ;',
  '                         owl:onProperty :childName ;',
  '                         owl:allValuesFrom xsd:string',
  '                       ] .',
  '',
  ':Pair rdf:type owl:Class ;',
  '      rdfs:subClassOf [ rdf:type owl:Restriction ;',
  '                        owl:onProperty :members ;',
  '                        owl:maxCardinality "2"^^xsd:nonNegativeInteger',
  '                      ] .',
  '',
  ':Defined rdf:type owl:Class ;',
  '         owl:equivalentClass [ rdf:type owl:Restriction ;',
  '                               owl:onProperty :defining ;',
  '                               owl:allValuesFrom xsd:string',
  '                             ] .',
  '',
  ':Quoted rdf:type owl:Class ;',
  '        rdfs:comment """an unbalanced [ bracket, and a line that ends with .',
  'more text ] ( )"""@en ;',
  '        rdfs:subClassOf :LogisticsObject ,',
  '                        [ rdf:type owl:Restriction ;',
  '                          owl:onProperty :afterString ;',
  '                          owl:allValuesFrom xsd:string',
  '                        ] ;',
  '        rdfs:label "[ [ ["@en .',
  '',
].join('\n')

describe('extractClasses: 3.2 own properties', () => {
  it('Price has exactly its four own properties, classified by kind', () => {
    const price = classOf(dm32, 'Price')
    expect(sortedKeys(price.properties)).toEqual([
      'chargeCode',
      'forBookingOption',
      'grandTotal',
      'ratings',
    ])
    expect(price.line).toBe(8623)
    expect(price.superclasses).toEqual(['LogisticsObject'])

    const { chargeCode, forBookingOption, grandTotal, ratings } = price.properties
    expect(ratings?.many).toBe(true)
    expect(grandTotal).toMatchObject({ range: 'xsd:double', kind: 'literal', many: false })
    expect(forBookingOption).toMatchObject({ range: ':BookingOption', kind: 'iri', many: false })
    expect(chargeCode).toMatchObject({ range: 'codes:ChargeCode', kind: 'code', many: false })
    for (const prop of Object.values(price.properties)) expect(prop.from).toBe('Price')
  })

  it('records each property declaration line', () => {
    const lines = dm32.split('\n')
    const { declLine } = propertyOf(dm32, 'Price', 'grandTotal')
    expect(declLine).not.toBeNull()
    expect(lines[(declLine ?? 0) - 1]).toMatch(/^:grandTotal rdf:type owl:DatatypeProperty\b/)
  })

  it('LogisticsObject owns exactly checks, events, externalReferences and skeletonIndicator', () => {
    expect(sortedKeys(classOf(dm32, 'LogisticsObject').properties)).toEqual([
      'checks',
      'events',
      'externalReferences',
      'skeletonIndicator',
    ])
  })

  it('classifies literal, code, iri and embedded ranges', () => {
    expect(propertyOf(dm32, 'BookingOption', 'statusBookingOption').kind).toBe('code')
    expect(propertyOf(dm32, 'Ratings', 'ranges').kind).toBe('embedded')
    expect(propertyOf(dm32, 'Booking', 'carrier').kind).toBe('iri')
    expect(propertyOf(dm32, 'Ratings', 'rcp')).toMatchObject({
      range: ':CodeListElement',
      kind: 'code',
    })
  })

  it('classifies a :LogisticsObject range itself as iri (the chain includes the range class)', () => {
    expect(propertyOf(dm32, 'Check', 'checkedObject')).toMatchObject({
      range: ':LogisticsObject',
      kind: 'iri',
    })
  })

  it('does not treat the owl:oneOf bracket of an enumeration as a restriction', () => {
    const status = classOf(dm32, 'BookingStatus')
    expect(status.properties).toEqual({})
    expect(status.superclasses).toEqual(['CodeListElement'])
  })

  it('reads the named superclass chain of Carrier', () => {
    const chain = extractClasses(dm32, ['Carrier', 'Company', 'Organization', 'LogisticsAgent'])
    expect(chain.Carrier?.superclasses).toEqual(['Company'])
    expect(chain.Company?.superclasses).toEqual(['Organization'])
    expect(chain.Organization?.superclasses).toEqual(['LogisticsAgent'])
    expect(chain.LogisticsAgent?.superclasses).toEqual(['LogisticsObject'])
  })

  it('returns one entry per requested name', () => {
    expect(sortedKeys(extractClasses(dm32, ['Price', 'Ratings']))).toEqual(['Price', 'Ratings'])
  })
})

describe('extractClasses: inheritance', () => {
  it("defaults to inherit: 'none'", () => {
    const booking = classOf(dm32, 'Booking')
    expect(booking.superclasses).toEqual(['LogisticsService'])
    expect(booking.properties.contactPersons).toBeUndefined()
    expect(booking.properties.carrier?.from).toBe('Booking')
  })

  it("'intermediate' merges superclasses up to, but not including, LogisticsObject", () => {
    const booking = classOf(dm32, 'Booking', 'intermediate')
    for (const key of ['activitySequences', 'contactDetails', 'contactPersons']) {
      expect(booking.properties[key]?.from).toBe('LogisticsService')
    }
    expect(booking.properties.contactPersons?.kind).toBe('iri')
    expect(booking.properties.carrier?.from).toBe('Booking')
    for (const key of ['checks', 'events', 'externalReferences', 'skeletonIndicator']) {
      expect(booking.properties[key]).toBeUndefined()
    }
  })

  it("'intermediate' walks a multi-level chain (Carrier → Company → Organization → LogisticsAgent)", () => {
    const carrier = classOf(dm32, 'Carrier', 'intermediate')
    expect(carrier.properties.airlineCode?.from).toBe('Carrier')
    expect(carrier.properties.iataCargoAgentCode?.from).toBe('Company')
    expect(carrier.properties.name?.from).toBe('Organization')
    // :LogisticsAgent owns no restrictions in 3.2, and nothing comes from :LogisticsObject.
    const sources = new Set(Object.values(carrier.properties).map((p) => p.from))
    expect(sources).toEqual(new Set(['Carrier', 'Company', 'Organization']))
  })
})

describe('extractClasses: robustness', () => {
  it('gives the same result for CRLF input', () => {
    const crlf = dm32.replace(/\r?\n/g, '\r\n')
    expect(crlf).toContain('\r\n')
    expect(extractClasses(crlf, ['Price'])).toEqual(extractClasses(dm32, ['Price']))
  })

  it('ignores brackets and " ." inside string literals, including multi-line ones', () => {
    const quoted = classOf(SYNTHETIC, 'Quoted')
    expect(quoted.properties).toEqual({
      afterString: {
        range: 'xsd:string',
        kind: 'literal',
        many: true,
        declLine: null,
        from: 'Quoted',
      },
    })
  })

  it('throws on an unknown class name', () => {
    expect(() => extractClasses(dm32, ['NoSuchClass'])).toThrow(/NoSuchClass/)
  })

  it('throws eagerly on an unterminated class block or a duplicate declaration', () => {
    const unterminated = ':Open rdf:type owl:Class ;\n     rdfs:label "Open"@en ;\n'
    expect(() => extractOneOf(unterminated, 'Open')).toThrow(/not terminated/)
    const duplicate = ':Twice rdf:type owl:Class .\n\n:Twice rdf:type owl:Class .\n'
    expect(() => extractClasses(duplicate, ['Twice'])).toThrow(/declared twice/)
  })
})

describe('extractClasses: restrictions it does not understand', () => {
  it('throws when a requested class has one', () => {
    expect(() => extractClasses(SYNTHETIC, ['Base'])).toThrow(/owl:minCardinality/)
  })

  it('throws when an intermediate superclass has one and inheritance is requested', () => {
    expect(() => extractClasses(SYNTHETIC, ['Child'], { inherit: 'intermediate' })).toThrow(
      /owl:minCardinality/,
    )
  })

  it('throws on an owl:maxCardinality other than "1" in a class that is read', () => {
    expect(() => extractClasses(SYNTHETIC, ['Pair'])).toThrow(/owl:maxCardinality/)
  })

  it('throws on a restriction that is not a direct rdfs:subClassOf object in a class that is read', () => {
    expect(() => extractClasses(SYNTHETIC, ['Defined'])).toThrow(/not a direct rdfs:subClassOf/)
  })

  it('does not throw for a class that is not read', () => {
    expect(sortedKeys(classOf(SYNTHETIC, 'Child').properties)).toEqual(['childName'])
  })

  it('3.3.0: Price extracts although LogisticsEvent carries an owl:minCardinality', () => {
    expect(() => extractClasses(dm33, ['LogisticsEvent'])).toThrow(/owl:minCardinality/)
    expect(ignoringLines(extractClasses(dm33, ['Price']))).toEqual(
      ignoringLines(extractClasses(dm32, ['Price'])),
    )
  })
})

describe('extractOneOf', () => {
  it('reads a DM enumeration nested in owl:equivalentClass', () => {
    expect(extractOneOf(dm32, 'BookingStatus')).toEqual([
      'CONFIRMED',
      'DELETED',
      'QUEUED',
      'REJECTED',
    ])
  })

  it('reads a CL code list from its #fragment IRIs', () => {
    expect(extractOneOf(cl32, 'ChargeIdentifier')).toEqual([
      'CN',
      'CO',
      'CT',
      'IN',
      'NI',
      'OA',
      'OC',
      'SI',
      'TX',
      'VC',
      'WT',
    ])
  })

  it('keeps the whole #fragment, including non-ASCII characters', () => {
    expect(extractOneOf(cl32, 'CommodityCode')).toContain('LIVE_MMLS_DOGS_Löwchen')
  })

  it('reads a CL subset list whose members belong to another code list', () => {
    // :WeightUnitCode enumerates <…/code-lists/MeasurementUnitCode#KGM> etc.
    expect(extractOneOf(cl32, 'WeightUnitCode')).toEqual(['KGM', 'LBR', 'ONZ'])
  })

  it('3.3.0 status enumerations equal 3.2', () => {
    for (const name of ['BookingStatus', 'BookingOptionStatus']) {
      const v32 = extractOneOf(dm32, name)
      expect(v32.length).toBeGreaterThan(0)
      expect(extractOneOf(dm33, name)).toEqual(v32)
    }
  })

  it('throws on an unknown class name', () => {
    expect(() => extractOneOf(dm32, 'NoSuchList')).toThrow(/NoSuchList/)
  })

  it('throws for a class that has no owl:oneOf', () => {
    expect(() => extractOneOf(dm32, 'Price')).toThrow(/Price/)
  })
})

describe('vendored files', () => {
  it('pins exactly the three TTL files', () => {
    expect(sortedKeys(VENDORED_SHA256)).toEqual([...TTL_FILES].sort())
  })

  it.each(TTL_FILES)('%s matches its pinned sha256Lf', (path) => {
    expect(sha256Lf(readVendored(path))).toBe(VENDORED_SHA256[path])
  })

  it('README.md lists the same sha256Lf values', () => {
    const readme = readVendored('README.md')
    const fromReadme: Record<string, string> = {}
    for (const m of readme.matchAll(/^\| `([^`]+\.ttl)` \|.*\| `([0-9a-f]{64})` \|$/gm)) {
      const [, path, hash] = m
      if (path !== undefined && hash !== undefined) fromReadme[path] = hash
    }
    expect(fromReadme).toEqual(VENDORED_SHA256)
  })

  it('readVendored returns LF text', () => {
    for (const path of [...TTL_FILES, 'LICENSE', 'README.md']) {
      expect(readVendored(path)).not.toContain('\r')
    }
    expect(readVendored('LICENSE')).toMatch(/^MIT License\n/)
  })
})

describe('sha256Lf', () => {
  it('hashes LF-normalised UTF-8 text', () => {
    expect(sha256Lf('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256Lf('a\r\nb\r\n')).toBe(sha256Lf('a\nb\n'))
    expect(sha256Lf('a\nb')).not.toBe(sha256Lf('a\nb\n'))
  })
})
