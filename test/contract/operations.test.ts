import { describe, expect, it } from 'vitest'
import type { Change } from '../../src/classes/change/schema.js'
import type { Waybill } from '../../src/classes/waybill/schema.js'
import { WaybillCodec, applyChange, asJsonPointer } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: Operations (JSON-Patch via applyChange) (T5.6)', () => {
  it.skipIf(!stackUp)(
    'applies a Change locally then POSTs the patched Waybill — round-trip preserves the patch',
    async () => {
      // Step 1: POST the original Waybill to NE:ONE.
      const original: Waybill = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Waybill',
        '@id': `https://test.flaks.example/test/waybill/operations-${Date.now()}`,
        waybillType: 'MASTER',
        waybillPrefix: '777',
        waybillNumber: '12345678',
      }
      const originalWire = WaybillCodec.serialize(original) as Record<string, unknown>
      const { iri: originalIri } = await postLogisticsObject(originalWire)

      // Step 2: build a Change that replaces waybillNumber via JSON-Patch.
      const pathResult = asJsonPointer('/waybillNumber')
      expect(pathResult.ok).toBe(true)
      if (!pathResult.ok) return
      const change: Change = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Change',
        '@id': `https://test.flaks.example/test/change/contract-${Date.now()}`,
        hasOperation: [
          {
            '@context': CARGO_CONTEXT_IRI,
            '@type': 'Operation',
            '@id': `https://test.flaks.example/test/operation/contract-${Date.now()}`,
            op: 'ADD',
            path: '/waybillNumber',
            value: '99999999',
          },
        ],
      }

      // Step 3: apply the Change locally via the library.
      const patched = applyChange(WaybillCodec, original, change)
      expect(patched.ok).toBe(true)
      if (!patched.ok) return
      expect(patched.value.waybillNumber).toBe('99999999')

      // Step 4: POST the patched Waybill back; round-trip should preserve.
      const patchedWire = WaybillCodec.serialize({
        ...patched.value,
        '@id': `https://test.flaks.example/test/waybill/operations-patched-${Date.now()}`,
      } as never) as Record<string, unknown>
      const { iri: patchedIri } = await postLogisticsObject(patchedWire)
      const got = await getLogisticsObject(patchedIri)
      expect(got.waybillNumber).toBe('99999999')
      expect(got.waybillPrefix).toBe('777') // unchanged

      // The original is still on the server with the original number.
      const gotOriginal = await getLogisticsObject(originalIri)
      expect(gotOriginal.waybillNumber).toBe('12345678')
    },
  )
})
