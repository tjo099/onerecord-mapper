import { z } from 'zod'
import { ScreeningExemption, ScreeningMethod, SecurityStatus } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const SecurityDeclarationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('SecurityDeclaration'),
  screeningMethods: z.array(ScreeningMethod).optional(),
  securityStatus: SecurityStatus.optional(),
  groundsForExemption: z.array(ScreeningExemption).optional(),
  additionalSecurityInformation: z.string().min(1).optional(),
  otherScreeningMethods: z.array(z.string().min(1)).optional(),
  issuedOn: z.string().datetime().optional(),
  issuedBy: safeIri().optional(),
  issuedForPiece: z.array(safeIri()).optional(),
  regulatedEntityIssuer: safeIri().optional(),
  regulatedEntityAcceptor: z.array(safeIri()).optional(),
  receivedFrom: safeIri().optional(),
  otherRegulatedEntities: z.array(safeIri()).optional(),
  // issuedForShipment is 3.2.1-master-only (#344/#346) — deviation #12. Excluded.
}).strict()

export type SecurityDeclaration = z.infer<typeof SecurityDeclarationSchema>
export type JsonLdSecurityDeclaration = JsonLd<'SecurityDeclaration'>
