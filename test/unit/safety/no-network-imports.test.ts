import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')

const FORBIDDEN_STATIC = [
  'node:http',
  'node:https',
  'node:net',
  'node:dns',
  'node:fs',
  'node:tls',
  'node:dgram',
  'node:vm',
  'node:child_process',
  'node:worker_threads',
  'node:inspector',
  'node:cluster',
  'node:perf_hooks',
  'http',
  'https',
  'fs',
  'net',
  'dns',
  'tls',
  'dgram',
]

/**
 * v2: explicit allowlist for `node:` imports in src/. Only `node:crypto`
 * (for randomUUID) is permitted — see spec amendment candidate §3.
 */
const ALLOWED_NODE_IMPORTS = new Set(['node:crypto'])

const FORBIDDEN_PATTERNS: Array<[RegExp, string]> = [
  [/\bglobalThis\.fetch\b/, 'globalThis.fetch'],
  [/\bglobalThis\.XMLHttpRequest\b/, 'globalThis.XMLHttpRequest'],
  [/(^|[^.\w])fetch\s*\(/, 'bare fetch('],
  // v2 (A2-m2): catch property-access fetch (`x.fetch(`, `x?.fetch(`)
  [/\.\??fetch\s*\(/, 'property-access .fetch( or ?.fetch('],
  [/\beval\s*\(/, 'eval('],
  [/new\s+Function\s*\(/, 'new Function('],
  [/import\s*\(\s*[a-zA-Z_$][\w$]*\s*\)/, 'dynamic import(<expr>)'],
  [/require\s*\(\s*[a-zA-Z_$][\w$]*\s*\)/, 'dynamic require(<expr>)'],
]

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const s = statSync(p)
    if (s.isDirectory()) yield* walk(p)
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) yield p
  }
}

describe('no network I/O in src/', () => {
  it('does not statically import any I/O-capable builtin (node:crypto allowed)', () => {
    for (const file of walk(SRC)) {
      const txt = readFileSync(file, 'utf8')
      // Detect any node: import; allowlist only node:crypto
      const nodeImports = [...txt.matchAll(/from\s+['"](node:[a-z_]+)['"]/g)].map((m) => m[1])
      for (const ni of nodeImports) {
        // biome-ignore lint/style/noNonNullAssertion: m[1] is always defined when capture group matches
        if (!ALLOWED_NODE_IMPORTS.has(ni!)) {
          throw new Error(
            `forbidden node import "${ni}" in ${file} (allowed: ${[...ALLOWED_NODE_IMPORTS].join(', ')})`,
          )
        }
      }
      for (const mod of FORBIDDEN_STATIC) {
        const importRe = new RegExp(`from\\s+['"]${mod.replace('.', '\\.')}['"]`)
        const requireRe = new RegExp(`require\\(\\s*['"]${mod.replace('.', '\\.')}['"]\\s*\\)`)
        if (importRe.test(txt) || requireRe.test(txt)) {
          throw new Error(`forbidden import "${mod}" in ${file}`)
        }
      }
    }
    expect(true).toBe(true)
  })

  it('does not use forbidden global / dynamic patterns', () => {
    for (const file of walk(SRC)) {
      const txt = readFileSync(file, 'utf8')
      for (const [re, name] of FORBIDDEN_PATTERNS) {
        if (re.test(txt)) {
          throw new Error(`forbidden pattern "${name}" in ${file}`)
        }
      }
    }
    expect(true).toBe(true)
  })
})
