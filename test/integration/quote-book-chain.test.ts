import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ClassName } from '../../src/factory-classes.js'
import { createMapper, dispatchGraphWalk, expectedTypeFor, onerecord } from '../../src/index.js'

type Node = Record<string, unknown> & { '@type': string; '@id': string }

const BASE = 'https://1r.example.com/logistics-objects/'
const CTX = 'https://onerecord.iata.org/ns/cargo'

const nodes: Node[] = JSON.parse(
  readFileSync(join(process.cwd(), 'test/fixtures/quote-book/chain.json'), 'utf8'),
).nodes

type Res = { ok: boolean; value: Record<string, unknown> }
const facade = (c: ClassName) => onerecord.deserialize[c] as unknown as (i: unknown) => Res

const mapper = createMapper({ graphWalk: true })
type MapperMethod = (input: unknown) => { ok: boolean; value?: unknown }
const mapperFor = (type: string): MapperMethod =>
  (mapper as unknown as Record<string, MapperMethod>)[`deserialize${type}`] as MapperMethod

// Deliberately external: TransportLegs locations are not part of the chain.
const EXTERNAL_IRIS = [
  'https://1r.example.com/locations/fra',
  'https://1r.example.com/locations/fra',
  'https://1r.example.com/locations/jfk',
  'https://1r.example.com/locations/osl',
]

const EXPECTED_EDGES = [
  'Booking.bookingRequest -> BookingRequest',
  'Booking.issuedForWaybill -> Waybill',
  'Booking.transportLegs -> TransportLegs',
  'Booking.transportLegs -> TransportLegs',
  'BookingOption.forBookingRequest -> BookingRequest',
  'BookingOption.price -> Price',
  'BookingOption.transportLegs -> TransportLegs',
  'BookingOption.transportLegs -> TransportLegs',
  'BookingRequest.booking -> Booking',
  'BookingRequest.forBookingOption -> BookingOption',
  'Price.forBookingOption -> BookingOption',
  'Price.ratings -> Ratings',
  'Price.ratings -> Ratings',
  'Price.ratings -> Ratings',
  'Ratings.forPrices -> Price',
  'Ratings.forPrices -> Price',
  'Ratings.forPrices -> Price',
  'Waybill.referredBookingOption -> Booking',
]

describe('Quote & Book chain fixture', () => {
  it('every node deserializes through the facade', () => {
    for (const node of nodes) {
      const r = (
        onerecord.deserialize[node['@type'] as ClassName] as (i: unknown) => { ok: boolean }
      )(node)
      expect(r.ok, `${node['@type']} ${node['@id']}`).toBe(true)
    }
  })

  it('every node deserializes through the graph-walk mapper (NOTE: remark is free text)', () => {
    for (const node of nodes) {
      const r = mapperFor(node['@type'])(node)
      expect(r.ok, `${node['@type']} ${node['@id']}`).toBe(true)
    }
  })

  it('has unique @ids and the expected @type multiset', () => {
    const ids = nodes.map((n) => n['@id'])
    expect(new Set(ids).size).toBe(ids.length)
    expect(nodes.map((n) => n['@type']).sort()).toEqual([
      'Booking',
      'BookingOption',
      'BookingRequest',
      'Price',
      'Ratings',
      'Ratings',
      'Ratings',
      'TransportLegs',
      'TransportLegs',
      'Waybill',
    ])
  })

  it('typed links form the exact edge list, with only TransportLegs locations external', () => {
    const typeById = new Map(nodes.map((n) => [n['@id'], n['@type']]))
    const edges: string[] = []
    const unresolved: string[] = []
    for (const node of nodes) {
      const r = onerecord.deserialize[node['@type'] as ClassName](node) as {
        ok: boolean
        value: Record<string, unknown>
      }
      expect(r.ok).toBe(true)
      for (const [field, raw] of Object.entries(r.value)) {
        if (field.startsWith('@')) continue
        const expected = expectedTypeFor(node['@type'], field)
        if (expected === undefined || expected === '*') continue
        for (const iri of Array.isArray(raw) ? raw : [raw]) {
          expect(typeof iri).toBe('string')
          const target = typeById.get(iri as string)
          if (target === undefined) {
            unresolved.push(iri as string)
            continue
          }
          expect(target, `${node['@type']}.${field} -> ${iri}`).toBe(expected)
          edges.push(`${node['@type']}.${field} -> ${target}`)
        }
      }
    }
    expect(edges.sort()).toEqual(EXPECTED_EDGES)
    expect(unresolved.sort()).toEqual(EXTERNAL_IRIS)
  })

  it('the Booking carries the NOTE: free-text remark in the fixture', () => {
    const booking = nodes.find((n) => n['@type'] === 'Booking') as Node
    expect(booking.stationRemarks).toEqual([{ remarksText: 'NOTE: ULD build-up' }])
  })
})

describe('IRI canonicalisation (Review Focus 4): references are canonicalised, @id is not', () => {
  const UPPER = 'https://1R.Example.com/logistics-objects/r1'
  const LOWER = `${BASE}r1`
  const price = {
    '@context': CTX,
    '@type': 'Price',
    '@id': `${BASE}price-x`,
    ratings: [UPPER],
  }

  it('a reference IRI with an uppercase host deserializes to the lowercase-host form', () => {
    const r = facade('Price')(price)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.ratings).toEqual([LOWER])
  })

  it('a Ratings node whose @id has the uppercase host keeps it verbatim', () => {
    const r = facade('Ratings')({
      '@context': CTX,
      '@type': 'Ratings',
      '@id': UPPER,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value['@id']).toBe(UPPER)
  })

  it('consequently the join misses, and the graph walk reports iri_not_canonical', () => {
    const r = facade('Price')(price)
    expect(r.ok && (r.value.ratings as string[])[0] === UPPER).toBe(false)

    const walk = dispatchGraphWalk(price, 'Price')
    expect(walk.ok).toBe(false)
    if (!walk.ok) {
      expect(walk.error.kind).toBe('iri_not_canonical')
      if (walk.error.kind === 'iri_not_canonical') {
        expect(walk.error.reason).toBe('host_not_lowercase')
        expect(walk.error.iri).toBe(UPPER)
      }
    }
  })
})
