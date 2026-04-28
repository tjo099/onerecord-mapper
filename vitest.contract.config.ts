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
    // Contract tests hit a local docker-compose stack. Running multiple
    // test files in parallel overwhelms the small dev stack and trips
    // 15s timeouts. Force serial file execution; tests within a file
    // remain sequential by default.
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
    fileParallelism: false,
    snapshotFormat: { printBasicPrototype: false },
    testTimeout: 30_000,
    hookTimeout: 15_000,
  },
})
