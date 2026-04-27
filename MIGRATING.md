# Migrating between versions

This file documents one entry per minor release.

## Migrating to v0.1.0

v0.1.0 is the first minor release. There is no prior version to migrate from.

### Install (current — v0.1.2 onwards)

```bash
npm install @flaks/onerecord
# or
bun add @flaks/onerecord
```

Pin a minor range in production (e.g. `"@flaks/onerecord": "^0.1.0"`).

### Older install paths (historical)

- `v0.1.0` shipped as a git-URL install only. Do not use — `dist/` was
  not in the tag. See CHANGELOG for details.
- `v0.1.1` attempted a `prepare`-script fix for git-URL installs.
  Does not work on Bun's default "trusted dependencies" model. Skipped
  in favor of v0.1.2 npm publish.

### Recommended import patterns

Standard imports:

```typescript
import { WaybillCodec, createMapper } from '@flaks/onerecord'
```

Tree-shake-optimized:

```typescript
import { WaybillCodec } from '@flaks/onerecord/codecs'
```

Type-only (zero runtime):

```typescript
import type { Waybill, ParseError } from '@flaks/onerecord/types'
```

### v0.x → v0.x+1 stability

Per `MIGRATING.md` policy: minor versions (0.1.x → 0.2.x) MAY introduce
breaking changes documented in the CHANGELOG; patch versions (0.1.0 → 0.1.x)
WILL NOT. Pin to a specific minor in CI.
