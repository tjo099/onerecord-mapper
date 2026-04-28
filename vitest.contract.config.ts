// Vitest config for contract tests against the OLF NE:ONE Server.
//
// Runs only test/contract/**. Tests assume the local NE:ONE stack is
// reachable (default http://localhost:8080) and use it.skipIf to bow out
// cleanly when it is not. See test/contract/_neone-client.ts for the
// envelope adapter + Keycloak auth helper.
//
// Invocation: `bun run test:contract`.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/contract/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    pool: 'threads',
    poolOptions: { threads: { singleThread: false } },
    snapshotFormat: { printBasicPrototype: false },
    // Contract tests hit the network; allow more headroom than unit tests.
    testTimeout: 15_000,
    hookTimeout: 10_000,
  },
})
