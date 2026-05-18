import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { OtherIdentifierSchema } from '../shared/value.js'
import { CompositionType } from '../../codes/index.js'

export const ComposingSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Composing'),
  composedPieces: z.array(safeIri()).optional(),               // → :Piece[]
  composedMaterials: z.array(safeIri()).optional(),            // → :LoadingMaterial[]
  compositionType: CompositionType.optional(),                 // max1
  loadingUnit: safeIri().optional(),                           // → :LoadingUnit max1
  actionStartTime: z.string().datetime({ offset: true }).optional(),
  actionEndTime: z.string().datetime({ offset: true }).optional(),
  performedAt: safeIri().optional(),                           // → :Location max1
  servedActivity: safeIri().optional(),                        // → :UnitComposition max1
  contactPersons: z.array(safeIri()).optional(),
  otherIdentifiers: z.array(OtherIdentifierSchema).optional(),
}).strict()

export type Composing = z.infer<typeof ComposingSchema>
export type JsonLdComposing = JsonLd<'Composing'>
