# Frozen 0.5.0 oracle

Test-only copy of the `@flaks/onerecord` **0.5.0** booking-chain schemas,
serializers and booking-flow helpers. It is the oracle for the v0.6.0 superset
tests (spec §5.5 G4a; plan Tasks 5–9).

- **Source:** `git show v0.5.0:src/<path>` from this repository's signed tag `v0.5.0`,
  for the paths listed in each file's first line.
- **Only changes:** a provenance header line; Biome re-sorted the imports; relative imports of shared modules (`src/iri`, `src/result.ts`,
  `src/safety`, `src/version.ts`, `src/util`, `src/classes/shared`) now point
  into `src/`.
- **Why that is safe:** those modules were byte-identical between `v0.5.0` and the
  start of the v0.6.0 branch (`git diff --stat v0.5.0 -- <paths>` was empty).
  The v0.6.0 work adds `src/classes/shared/distribution.ts` but changes none of
  the modules the oracle imports.
- **Why not the npm package:** installing the published package as an
  npm-alias devDependency was denied by the local permission policy. The tag
  holds the same source.

Do not edit these files. To refresh them, regenerate from the tag.
