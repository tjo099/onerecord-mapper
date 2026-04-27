# Migrating between versions

This file documents one entry per minor release.

## Migrating to v0.1.0

v0.1.0 is the first minor release. There is no prior version to migrate from.

### For internal consumers (Tracks B+C)

```bash
bun add git+https://github.com/tjo099/onerecord-mapper#v0.1.0
```

GitHub token auth required (private repo). Set `GITHUB_TOKEN` in your CI
environment if installing from CI.

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
