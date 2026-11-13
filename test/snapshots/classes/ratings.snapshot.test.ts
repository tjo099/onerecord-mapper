import { RatingsSchema, serializeRatings } from '../../../src/classes/ratings/index.js'
import { createRatings } from '../../factories/ratings.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Ratings',
  schema: RatingsSchema,
  serialize: serializeRatings,
  factory: createRatings,
})
