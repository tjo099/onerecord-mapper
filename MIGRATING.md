# Migrating between versions

This file documents one entry per minor release.

## Migrating to v0.1.0

v0.1.0 is the first minor release. There is no prior version to migrate from.

### Install

```bash
bun add git+https://github.com/tjo099/onerecord-mapper#v0.1.0
```

Pin to a specific tag in production. A future v0.2.0 release will
additionally publish to npm as the public scoped package
`@flaks/onerecord`; installing via git URL works today.

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
