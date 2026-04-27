export type { SafetyLimits, DeserializeOpts, SerializeOpts } from './limits.js'
export { DEFAULT_SAFETY_LIMITS, mergeLimits } from './limits.js'
export { preValidate } from './pre-validate.js'
export type { PreValidateOpts } from './pre-validate.js'
export { isForbiddenKey, scanForPollution } from './prototype-pollution.js'
export { detectCycle } from './circular-ref.js'
export {
  isSafePathSegment,
  isValidArrayIndex,
  validatePathSegments,
  unescapeJsonPointerSegment,
} from './path-traversal.js'
