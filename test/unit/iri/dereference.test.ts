import { describe, expect, it } from 'vitest'
import { dereferenceIri } from '../../../src/iri/dereference.js'

/**
 * Unit tests for the opt-in IRI dereferenceability helper (deferral I,
 * deviation #7 closure). Uses a custom fetcher to avoid network I/O.
 */

function mockFetch(responses: Record<string, { status: number; ok: boolean }>): typeof fetch {
  return ((url: string | URL | Request) => {
    const key = url.toString()
    const r = responses[key]
    if (!r) return Promise.reject(new TypeError(`mock: no response for ${key}`))
    return Promise.resolve(new Response(null, { status: r.status }))
  }) as typeof fetch
}

describe('dereferenceIri (deferral I)', () => {
  it('reports reachable: true on HEAD 200', async () => {
    const fetcher = mockFetch({
      'https://example.com/wb/1': { status: 200, ok: true },
    })
    const r = await dereferenceIri('https://example.com/wb/1', { fetcher })
    expect(r.reachable).toBe(true)
    expect(r.status).toBe(200)
  })

  it('falls back to GET when HEAD returns 405', async () => {
    let calls = 0
    const fetcher = ((url: string | URL | Request, init?: RequestInit) => {
      calls++
      const status = init?.method === 'HEAD' ? 405 : 200
      return Promise.resolve(new Response(null, { status }))
    }) as typeof fetch
    const r = await dereferenceIri('https://example.com/wb/2', { fetcher })
    expect(r.reachable).toBe(true)
    expect(calls).toBe(2) // HEAD then GET
  })

  it('reports reachable: false on 404', async () => {
    const fetcher = ((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(null, { status: 404 }))) as typeof fetch
    const r = await dereferenceIri('https://example.com/missing', { fetcher })
    expect(r.reachable).toBe(false)
    expect(r.status).toBe(404)
    expect(r.reason).toBe('http_error')
  })

  it('rejects non-http(s) schemes without making a request', async () => {
    let calls = 0
    const fetcher = (() => {
      calls++
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as typeof fetch
    const r = await dereferenceIri('ftp://example.com/x', { fetcher })
    expect(r.reachable).toBe(false)
    expect(r.reason).toBe('disallowed_scheme')
    expect(calls).toBe(0)
  })

  it('reports invalid_url for malformed input', async () => {
    const r = await dereferenceIri('not a url')
    expect(r.reachable).toBe(false)
    expect(r.reason).toBe('invalid_url')
  })

  it('reports timeout when AbortSignal fires', async () => {
    const controller = new AbortController()
    const fetcher = ((_url: string | URL | Request, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    }) as typeof fetch
    setTimeout(() => controller.abort(), 10)
    const r = await dereferenceIri('https://example.com/slow', {
      fetcher,
      signal: controller.signal,
    })
    expect(r.reachable).toBe(false)
    expect(r.reason).toBe('timeout')
  })

  it('passes Authorization header when provided', async () => {
    let capturedAuth: string | null = null
    const fetcher = ((_url: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      capturedAuth = headers.get('Authorization')
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as typeof fetch
    await dereferenceIri('https://example.com/x', {
      fetcher,
      authHeader: 'Bearer my-token',
    })
    expect(capturedAuth).toBe('Bearer my-token')
  })
})
