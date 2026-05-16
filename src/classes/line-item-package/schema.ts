import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { ValueSchema } from '../shared/value.js'

export const LineItemPackageSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('LineItemPackage'),
  pieceReferences: z.array(safeIri()).optional(),
  packageGrossWeight: ValueSchema.optional(),
  packageVolume: ValueSchema.optional(),
  packageSlac: z.number().int().nonnegative().optional(),
}).strict()

export type LineItemPackage = z.infer<typeof LineItemPackageSchema>
export type JsonLdLineItemPackage = JsonLd<'LineItemPackage'>
