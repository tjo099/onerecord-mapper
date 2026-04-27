import type { z } from 'zod'
import type { ParseResult } from '../../result.js'
import type { DeserializeOpts, SerializeOpts } from '../../safety/limits.js'

/**
 * v2 (A1-M3): T parameter narrows the `type` literal so consumers can write
 * `switch (codec.type) { case 'Waybill': ... }` and get exhaustiveness.
 */
export interface Codec<App, Wire, T extends string = string> {
  readonly schema: z.ZodType<App>
  readonly serialize: (input: App, opts?: SerializeOpts) => Wire
  readonly serializeStrict: (input: App, opts?: SerializeOpts) => ParseResult<Wire>
  readonly deserialize: (input: unknown, opts?: DeserializeOpts) => ParseResult<App>
  readonly type: T
}
