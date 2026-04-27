// src/iri/index.ts
export type { IriStrategy, SafeIri, IriParts, ClassName } from './strategy.js'
export { defaultIriStrategy } from './default-strategy.js'
export { validateIri } from './validate.js'
export type { ValidateIriOpts } from './validate.js'
export { normalizeIri, iriEquals } from './normalize.js'
export { buildIri } from './build.js'
export { safeIri, extractInvalidIriIssue, findInvalidIriInIssues } from './zod-safe-iri.js'
