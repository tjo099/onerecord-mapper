import { describe, expect, it } from 'vitest'
import { OneRecordNotificationSchema, OneRecordSubscriptionSchema } from '../../src/api/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getNeoneToken, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()
const NEONE_URL = process.env.NEONE_URL ?? 'http://localhost:8080'
const API = 'https://onerecord.iata.org/ns/api#'
const CONTEXT = {
  api: API,
  cargo: 'https://onerecord.iata.org/ns/cargo#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
}

type Node = Record<string, unknown>

async function headers(): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer ${await getNeoneToken()}`,
    'Content-Type': 'application/ld+json',
    Accept: 'application/ld+json',
  }
}

function graphOf(body: Node): Node[] {
  return Array.isArray(body['@graph']) ? (body['@graph'] as Node[]) : [body]
}

function hasType(node: Node, type: string): boolean {
  const t = node['@type']
  return Array.isArray(t) ? t.includes(type) : t === type
}

// ONE Record API 2.2: a subscriber POSTs an api:Subscription to the
// publisher's /subscriptions endpoint, which answers 201 with the IRI of the
// api:SubscriptionRequest it created. Publishers deliver api:Notification
// objects by POSTing them to the subscriber's /notifications endpoint.
describe('contract: API 2.2 subscriptions and notifications (T5.7)', () => {
  it.skipIf(!stackUp)(
    'POST /subscriptions with a schema-valid Subscription creates a pending SubscriptionRequest',
    async () => {
      const { iri: topic } = await postLogisticsObject({
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Shipment',
        '@id': `https://test.flaks.example/test/shipment/notif-topic-${Date.now()}`,
        goodsDescription: 'Notification topic',
      })
      const subscription = OneRecordSubscriptionSchema.parse({
        '@type': 'api:Subscription',
        'api:hasSubscriber': { '@id': 'https://test.flaks.example/test/company/notif-subscriber' },
        'api:hasTopicType': { '@id': 'api:LOGISTICS_OBJECT_IDENTIFIER' },
        'api:hasTopic': { '@type': 'xsd:anyURI', '@value': topic },
        'api:includeSubscriptionEventType': [{ '@id': 'api:LOGISTICS_OBJECT_UPDATED' }],
      })

      const res = await fetch(`${NEONE_URL}/subscriptions`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify({ '@context': CONTEXT, ...subscription }),
      })
      expect(res.status).toBe(201)
      const requestIri = res.headers.get('location')
      expect(requestIri).toMatch(/^https?:\/\//)

      const got = await fetch(requestIri as string, { headers: await headers() })
      expect(got.status).toBe(200)
      const graph = graphOf((await got.json()) as Node)
      const request = graph.find((n) => hasType(n, `${API}SubscriptionRequest`))
      expect(request).toBeDefined()
      expect((request as Node)[`${API}hasRequestStatus`]).toEqual({
        '@id': `${API}REQUEST_PENDING`,
      })

      const subRef = (request as Node)[`${API}hasSubscription`] as { '@id': string }
      const stored = graph.find((n) => n['@id'] === subRef['@id'])
      expect(stored).toBeDefined()
      expect(((stored as Node)[`${API}hasTopic`] as { '@value': string })['@value']).toBe(topic)
    },
  )

  it.skipIf(!stackUp)(
    'POST /notifications accepts a schema-valid Notification (subscriber inbox)',
    async () => {
      const notification = OneRecordNotificationSchema.parse({
        '@context': CONTEXT,
        '@type': 'api:Notification',
        'api:hasEventType': { '@id': 'api:LOGISTICS_OBJECT_UPDATED' },
        'api:hasLogisticsObject': { '@id': 'https://test.flaks.example/test/shipment/remote-1' },
        'api:hasLogisticsObjectType': {
          '@type': 'xsd:anyURI',
          '@value': 'https://onerecord.iata.org/ns/cargo#Shipment',
        },
      })

      const res = await fetch(`${NEONE_URL}/notifications`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(notification),
      })
      expect(res.status).toBe(204)
    },
  )
})
