---
name: Bug report
about: Report incorrect behavior — round-trip mismatch, validation false positive/negative, runtime error
title: '[BUG] '
labels: ['bug', 'needs-triage']
---

## Description

<!-- What did you expect to happen, and what actually happened? -->

## Reproduction

```typescript
// Minimal code that reproduces the issue
import { WaybillCodec } from '@flaks/onerecord'

const result = WaybillCodec.deserialize(/* ... */)
// ...
```

## OneRecord spec reference

<!-- Cargo data model section (§) or API spec section, e.g. "data model §3.2.4". Mark N/A if library-internal. -->

## Environment

- `@flaks/onerecord` version:
- Bun version (`bun --version`):
- Node version (`node --version`) if relevant:
- OS:
- TypeScript version if relevant:

## Additional context

<!-- Stack trace, logs, related issues -->
