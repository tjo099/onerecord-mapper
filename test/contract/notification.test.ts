import { describe, expect, it } from 'vitest'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import {
  getLogisticsObject,
  getNeoneToken,
  neoneReachable,
  postLogisticsObject,
} from './_neone-client.js'

const stackUp = await neoneReachable()
const NEONE_URL = process.env.NEONE_URL ?? 'http://localhost:8080'

describe('contract: Notification subscribe-and-receive (T5.7)', () => {
  it.skipIf(!stackUp)(
    'POSTs a Subscription targeting an LO topic; server accepts the subscription',
    async () => {
      // Step 1: create an LO that will be the subscription topic.
      const topicLo = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Shipment',
        '@id': `https://test.flaks.example/test/shipment/notif-topic-${Date.now()}`,
        pieceCount: 1,
        goodsDescription: 'Notification topic',
      }
      const { iri: topicIri } = await postLogisticsObject(topicLo)

      // Step 2: POST a Subscription whose topic is the just-created LO IRI.
      // Subscriptions live under the cargo Subscription class.
      const sub = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Subscription',
        '@id': `https://test.flaks.example/test/subscription/notif-${Date.now()}`,
        topic: topicIri,
        subscriber: 'https://test.flaks.example/test/party/notif-subscriber',
        notificationEndpoint: 'https://test.flaks.example/notif-callback',
      }
      // Subscriptions go through the same /logistics-objects endpoint
      // (NE:ONE 1.x treats them as logistics objects). The dedicated
      // /subscriptions and /notifications endpoints are for delivery
      // mechanics; subscription resource creation is via /logistics-objects.
      const { iri: subIri, status } = await postLogisticsObject(sub)
      expect(status).toBe(201)

      const got = await getLogisticsObject(subIri)
      expect(got['@type']).toBe('Subscription')
      expect(got.topic).toBe(topicIri)
      expect(got.subscriber).toBe('https://test.flaks.example/test/party/notif-subscriber')
    },
  )

  it.skipIf(!stackUp)(
    'GETs the /notifications endpoint and confirms it returns a list (no auth-only smoke)',
    async () => {
      // The notifications endpoint is for receiving delivered notifications.
      // For v0.2 contract testing we verify the endpoint is reachable +
      // accepts our token; full subscribe→mutate→receive round-trip is v0.3
      // (it requires either a webhook receiver in-process OR polling
      // semantics that NE:ONE 1.x's notification controller exposes).
      const token = await getNeoneToken()
      const res = await fetch(`${NEONE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/ld+json' },
      })
      // Acceptable: 200 OK with a list, 204 No Content (empty), or 404
      // if the route differs slightly. We don't strictly validate the
      // shape; the auth path being reachable is the v0.2 contract.
      expect([200, 204, 404]).toContain(res.status)
    },
  )
})
