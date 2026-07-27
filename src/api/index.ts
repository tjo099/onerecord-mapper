import { z } from 'zod'
import { safeIri } from '../iri/zod-safe-iri.js'

/**
 * Endorsed ONE Record production baseline (28 July 2025).
 *
 * The development specification is deliberately not used as the default wire
 * contract. Development versions can be advertised in addition to this
 * baseline once a product implements them completely.
 */
export const ONE_RECORD_API_VERSION = '2.2.0' as const
export const ONE_RECORD_CARGO_ONTOLOGY_VERSION = '3.2.0' as const
export const ONE_RECORD_ORCHESTRATION_VERSION = '1.1.0' as const
export const ONE_RECORD_API_ONTOLOGY = 'https://onerecord.iata.org/ns/api' as const
export const ONE_RECORD_CARGO_ONTOLOGY = 'https://onerecord.iata.org/ns/cargo' as const
export const ONE_RECORD_API_ONTOLOGY_VERSION =
  `${ONE_RECORD_API_ONTOLOGY}/${ONE_RECORD_API_VERSION}` as const
export const ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI =
  `${ONE_RECORD_CARGO_ONTOLOGY}/${ONE_RECORD_CARGO_ONTOLOGY_VERSION}` as const

const nonEmptyArray = <T extends z.ZodType>(schema: T) => z.array(schema).min(1)
const oneRecordIri = z.union([
  safeIri(),
  z.string().regex(/^(?:api|cargo):[A-Za-z][A-Za-z0-9_-]*$/),
])

export const JsonLdContextSchema = z.union([
  z.string().min(1),
  nonEmptyArray(z.union([z.string().min(1), z.record(z.string(), z.unknown())])),
  z.record(z.string(), z.unknown()),
])

export const OneRecordReferenceSchema = z
  .object({
    '@id': oneRecordIri,
    '@type': z.string().min(1).optional(),
  })
  .passthrough()

export const OneRecordTypedValueSchema = z
  .object({
    '@value': z.string(),
    '@type': z.string().min(1).optional(),
  })
  .strict()

export const OneRecordRequestStatusSchema = z.enum([
  'api:REQUEST_PENDING',
  'api:REQUEST_ACCEPTED',
  'api:REQUEST_REJECTED',
  'api:REQUEST_FAILED',
  'api:REQUEST_REVOKED',
  'api:REQUEST_ACKNOWLEDGED',
])

export const OneRecordServerInformationSchema = z
  .object({
    '@context': JsonLdContextSchema,
    '@id': safeIri(),
    '@type': z.union([
      z.literal('api:ServerInformation'),
      z.literal('https://onerecord.iata.org/ns/api#ServerInformation'),
    ]),
    'api:hasDataHolder': OneRecordReferenceSchema,
    'api:hasServerEndpoint': safeIri(),
    'api:hasSupportedApiVersion': nonEmptyArray(z.string().min(1)),
    'api:hasSupportedContentType': nonEmptyArray(z.string().min(1)),
    'api:hasSupportedLanguage': nonEmptyArray(z.string().min(1)),
    'api:hasSupportedOntology': nonEmptyArray(safeIri()),
    'api:hasSupportedOntologyVersion': nonEmptyArray(safeIri()),
    'api:hasSupportedEncoding': z.array(z.string().min(1)).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value['api:hasSupportedContentType'].includes('application/ld+json')) {
      ctx.addIssue({
        code: 'custom',
        path: ['api:hasSupportedContentType'],
        message: 'ONE Record servers must support application/ld+json',
      })
    }
    for (const ontology of value['api:hasSupportedOntology']) {
      if (/\/\d+\.\d+(?:\.\d+)?$/.test(ontology)) {
        ctx.addIssue({
          code: 'custom',
          path: ['api:hasSupportedOntology'],
          message: 'Supported ontology identifiers must be non-versioned IRIs',
        })
      }
    }
    for (const ontology of value['api:hasSupportedOntologyVersion']) {
      if (!/\/\d+\.\d+(?:\.\d+)?$/.test(ontology)) {
        ctx.addIssue({
          code: 'custom',
          path: ['api:hasSupportedOntologyVersion'],
          message: 'Supported ontology-version identifiers must be versioned IRIs',
        })
      }
    }
  })

const ActionRequestFields = {
  '@context': JsonLdContextSchema,
  '@id': safeIri(),
  'api:hasRequestStatus': OneRecordReferenceSchema,
  'api:isRequestedBy': OneRecordReferenceSchema,
  'api:isRequestedAt': OneRecordTypedValueSchema,
  'api:hasRequestStatusSince': OneRecordTypedValueSchema.optional(),
  'api:isRevokedBy': OneRecordReferenceSchema.optional(),
  'api:isRevokedAt': OneRecordTypedValueSchema.optional(),
  'api:hasError': z.array(z.record(z.string(), z.unknown())).optional(),
} as const

export const OneRecordChangeRequestSchema = z
  .object({
    ...ActionRequestFields,
    '@type': z.literal('api:ChangeRequest'),
    'api:hasChange': z.union([OneRecordReferenceSchema, z.record(z.string(), z.unknown())]),
  })
  .strict()

export const OneRecordSubscriptionSchema = z
  .object({
    '@id': safeIri().optional(),
    '@type': z.literal('api:Subscription'),
    'api:hasContentType': z.string().min(1).optional(),
    'api:hasSubscriber': OneRecordReferenceSchema,
    'api:hasTopicType': OneRecordReferenceSchema,
    'api:includeSubscriptionEventType': nonEmptyArray(OneRecordReferenceSchema),
    'api:hasTopic': z.union([safeIri(), OneRecordTypedValueSchema]),
    'api:expiresAt': OneRecordTypedValueSchema.optional(),
    'api:hasDescription': z.string().optional(),
    'api:notifyRequestStatusChange': z.boolean().optional(),
    'api:sendLogisticsObjectBody': z.boolean().optional(),
  })
  .strict()

export const OneRecordSubscriptionRequestSchema = z
  .object({
    ...ActionRequestFields,
    '@type': z.literal('api:SubscriptionRequest'),
    'api:hasSubscription': OneRecordSubscriptionSchema,
  })
  .strict()

export const OneRecordAccessDelegationSchema = z
  .object({
    '@id': safeIri().optional(),
    '@type': z.literal('api:AccessDelegation'),
    'api:hasDescription': z.string().optional(),
    'api:hasPermission': nonEmptyArray(OneRecordReferenceSchema),
    'api:isRequestedFor': nonEmptyArray(OneRecordReferenceSchema),
    'api:hasLogisticsObject': nonEmptyArray(OneRecordReferenceSchema),
    'api:notifyRequestStatusChange': z.boolean(),
  })
  .strict()

export const OneRecordAccessDelegationRequestSchema = z
  .object({
    ...ActionRequestFields,
    '@type': z.literal('api:AccessDelegationRequest'),
    'api:hasAccessDelegation': OneRecordAccessDelegationSchema,
  })
  .strict()

export const OneRecordNotificationSchema = z
  .object({
    '@context': JsonLdContextSchema,
    '@id': safeIri().optional(),
    '@type': z.literal('api:Notification'),
    'api:hasEventType': OneRecordReferenceSchema,
    'api:hasLogisticsObject': OneRecordReferenceSchema.optional(),
    'api:hasLogisticsEvent': OneRecordReferenceSchema.optional(),
    'api:hasLogisticsObjectType': z.union([safeIri(), OneRecordTypedValueSchema]).optional(),
    'api:hasChangedProperty': z.array(z.union([safeIri(), OneRecordTypedValueSchema])).optional(),
    'api:hasTopic': z.union([safeIri(), OneRecordTypedValueSchema]).optional(),
    'api:isTriggeredBy': OneRecordReferenceSchema.optional(),
  })
  .strict()

export const OneRecordOidcProfileSchema = z
  .object({
    issuer: safeIri(),
    token_endpoint: safeIri(),
    jwks_uri: safeIri(),
    grant_types_supported: z.array(z.literal('client_credentials')).min(1),
  })
  .strict()

/**
 * Flaks Connect carries this standards-only peer metadata alongside its
 * optimized application-specific channels. It contains no plaintext secret.
 */
export const OneRecordPeerProfileSchema = z
  .object({
    server_endpoint: safeIri(),
    server_information: safeIri(),
    oidc_discovery: safeIri(),
    jwks_uri: safeIri(),
    data_holder: safeIri(),
    api_version: z.literal(ONE_RECORD_API_VERSION),
    cargo_ontology_version: z.literal(ONE_RECORD_CARGO_ONTOLOGY_VERSION),
  })
  .strict()

export type OneRecordServerInformation = z.infer<typeof OneRecordServerInformationSchema>
export type OneRecordChangeRequest = z.infer<typeof OneRecordChangeRequestSchema>
export type OneRecordSubscription = z.infer<typeof OneRecordSubscriptionSchema>
export type OneRecordSubscriptionRequest = z.infer<typeof OneRecordSubscriptionRequestSchema>
export type OneRecordAccessDelegation = z.infer<typeof OneRecordAccessDelegationSchema>
export type OneRecordAccessDelegationRequest = z.infer<
  typeof OneRecordAccessDelegationRequestSchema
>
export type OneRecordNotification = z.infer<typeof OneRecordNotificationSchema>
export type OneRecordPeerProfile = z.infer<typeof OneRecordPeerProfileSchema>

export function assertEndorsedServerInformation(value: unknown): OneRecordServerInformation {
  const parsed = OneRecordServerInformationSchema.parse(value)
  if (!parsed['api:hasSupportedApiVersion'].includes(ONE_RECORD_API_VERSION)) {
    throw new Error(`Server does not advertise ONE Record API ${ONE_RECORD_API_VERSION}`)
  }
  if (
    !parsed['api:hasSupportedOntologyVersion'].some(
      (ontology) => ontology === ONE_RECORD_CARGO_ONTOLOGY_VERSION_IRI,
    )
  ) {
    throw new Error(`Server does not advertise cargo ontology ${ONE_RECORD_CARGO_ONTOLOGY_VERSION}`)
  }
  return parsed
}
