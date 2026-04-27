import { defineConfig } from 'vitest/config'

const SHARD = process.env.VITEST_SHARD
const SHARD_TOTAL = process.env.VITEST_SHARD_TOTAL

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['test/contract/**', 'test/bench/**', 'test/property/**', 'test/bundle-size/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['./test/setup.ts'],
    pool: 'threads',
    poolOptions: { threads: { singleThread: false } },
    ...(SHARD && SHARD_TOTAL ? { shard: { index: Number(SHARD), count: Number(SHARD_TOTAL) } } : {}),
    snapshotFormat: { printBasicPrototype: false },
    resolveSnapshotPath: (testPath, snapExtension) =>
      testPath.replace(/\.test\.ts$/, '.snap' + snapExtension),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/**/*.d.ts'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
      reportOnFailure: true,
    },
    benchmark: { include: ['test/bench/**/*.bench.ts'] },
  },
})
