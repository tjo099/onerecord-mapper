import { describe, expect, it } from 'vitest'
import {
  ONE_RECORD_API_VERSION,
  ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI,
  OneRecordAccessDelegationRequestSchema,
  OneRecordChangeRequestSchema,
  OneRecordNotificationSchema,
  OneRecordPeerProfileSchema,
  OneRecordServerInformationSchema,
  OneRecordSubscriptionRequestSchema,
  assertEndorsedServerInformation,
} from '../../../src/api/index.js'

const context = {
  cargo: 'https://onerecord.iata.org/ns/cargo#',
  api: 'https://onerecord.iata.org/ns/api#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
}

const organization = {
  '@id': 'https://one.example/logistics-objects/company',
  '@type': 'cargo:Company',
}

const requestedAt = {
  '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
  '@value': '2026-07-26T12:00:00.000Z',
}

const actionFields = {
  '@context': context,
  '@id': 'https://one.example/action-requests/request-1',
  'api:hasRequestStatus': { '@id': 'api:REQUEST_PENDING' },
  'api:isRequestedBy': organization,
  'api:isRequestedAt': requestedAt,
  'api:hasRequestStatusSince': requestedAt,
}

describe('ONE Record API 2.2 wire contracts', () => {
  it('accepts endorsed ServerInformation and separates ontology names from versions', () => {
    const serverInformation = {
      '@context': context,
      '@id': 'https://one.example/',
      '@type': 'api:ServerInformation',
      'api:hasDataHolder': organization,
      'api:hasServerEndpoint': 'https://one.example/',
      'api:hasSupportedApiVersion': [ONE_RECORD_API_VERSION],
      'api:hasSupportedContentType': ['application/ld+json'],
      'api:hasSupportedLanguage': ['en-US'],
      'api:hasSupportedOntology': [
        'https://onerecord.iata.org/ns/cargo',
        'https://onerecord.iata.org/ns/api',
      ],
      'api:hasSupportedOntologyVersion': [
        ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI,
        'https://onerecord.iata.org/ns/api/2.2.0',
      ],
    }
    expect(OneRecordServerInformationSchema.parse(serverInformation)).toEqual(serverInformation)
    expect(assertEndorsedServerInformation(serverInformation)).toEqual(serverInformation)
  })

  it('rejects versioned identifiers in hasSupportedOntology', () => {
    const result = OneRecordServerInformationSchema.safeParse({
      '@context': context,
      '@id': 'https://one.example/',
      '@type': 'api:ServerInformation',
      'api:hasDataHolder': organization,
      'api:hasServerEndpoint': 'https://one.example',
      'api:hasSupportedApiVersion': ['2.2.0'],
      'api:hasSupportedContentType': ['application/ld+json'],
      'api:hasSupportedLanguage': ['en-US'],
      'api:hasSupportedOntology': [ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI],
      'api:hasSupportedOntologyVersion': [ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI],
    })
    expect(result.success).toBe(false)
  })

  it('accepts API-ontology action-request families', () => {
    expect(
      OneRecordChangeRequestSchema.safeParse({
        ...actionFields,
        '@type': 'api:ChangeRequest',
        'api:hasChange': { '@id': 'https://one.example/changes/change-1' },
      }).success,
    ).toBe(true)

    const subscription = {
      '@type': 'api:Subscription',
      'api:hasContentType': 'application/ld+json',
      'api:hasSubscriber': organization,
      'api:hasTopicType': { '@id': 'api:LOGISTICS_OBJECT_IDENTIFIER' },
      'api:includeSubscriptionEventType': [{ '@id': 'api:LOGISTICS_OBJECT_UPDATED' }],
      'api:hasTopic': 'https://one.example/logistics-objects/waybill-1',
    }
    expect(
      OneRecordSubscriptionRequestSchema.safeParse({
        ...actionFields,
        '@type': 'api:SubscriptionRequest',
        'api:hasSubscription': subscription,
      }).success,
    ).toBe(true)

    expect(
      OneRecordAccessDelegationRequestSchema.safeParse({
        ...actionFields,
        '@type': 'api:AccessDelegationRequest',
        'api:hasAccessDelegation': {
          '@type': 'api:AccessDelegation',
          'api:hasPermission': [{ '@id': 'api:GET_LOGISTICS_OBJECT' }],
          'api:isRequestedFor': [organization],
          'api:hasLogisticsObject': [{ '@id': 'https://one.example/logistics-objects/waybill-1' }],
          'api:notifyRequestStatusChange': true,
        },
      }).success,
    ).toBe(true)
  })

  it('accepts standard notifications without Flaks-specific transport headers', () => {
    expect(
      OneRecordNotificationSchema.safeParse({
        '@context': context,
        '@type': 'api:Notification',
        'api:hasEventType': { '@id': 'api:LOGISTICS_OBJECT_UPDATED' },
        'api:hasLogisticsObject': {
          '@id': 'https://one.example/logistics-objects/waybill-1',
        },
        'api:hasLogisticsObjectType': {
          '@type': 'http://www.w3.org/2001/XMLSchema#anyURI',
          '@value': 'https://onerecord.iata.org/ns/cargo#Waybill',
        },
      }).success,
    ).toBe(true)
  })

  it('requires a complete asymmetric peer profile', () => {
    expect(
      OneRecordPeerProfileSchema.safeParse({
        server_endpoint: 'https://one.example',
        server_information: 'https://one.example/',
        oidc_discovery: 'https://one.example/.well-known/onerecord/oidc-configuration',
        jwks_uri: 'https://one.example/.well-known/jwks.json',
        data_holder: organization['@id'],
        api_version: '2.2.0',
        cargo_ontology_version: '3.2.0',
      }).success,
    ).toBe(true)
  })
})
