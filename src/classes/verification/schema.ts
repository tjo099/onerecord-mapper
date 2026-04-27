import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const VerificationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Verification'),
  result: z.enum(['OK', 'NOT_OK', 'PENDING']),
  reason: z.string().max(512).optional(),
  verifiedObject: safeIri(),
}).strict()

export type Verification = z.infer<typeof VerificationSchema>

declare const UnverifiedBrand: unique symbol
/**
 * Branded type returned by `deserializeVerification` per spec §3.1: a
 * `Verification` payload coming over the wire is "unverified" until the
 * consumer cryptographically verifies it. The brand prevents accidental
 * use of an unverified value where a verified one is required.
 */
export type UnverifiedVerification = Verification & {
  readonly [UnverifiedBrand]: true
}

export type JsonLdVerification = JsonLd<'Verification'>
