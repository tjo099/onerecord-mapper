# Changelog

All notable changes are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/) per the policy in `MIGRATING.md`.

## [Unreleased] (0.0.x prerelease scaffold)

### Build / dev environment changes (vs locked plan)
- Bun pin: `engines.bun` set to `1.3.x` (plan was `1.1.x`); CI `bun-version: '1.3.11'`. Reason: local toolchain is 1.3.11.
- `xlsx` devDep pinned to `^0.18.5` (plan was `^0.20.0`). Reason: 0.20.x is SheetJS Pro CDN-only, not public npm.
- `dependabot.yml` adds `ignore: [{ dependency-name: "*", update-types: ["version-update:semver-major"] }]` for both `github-actions` and `npm` ecosystems. Reason: locked plan pins specific majors (Biome 1.x, Vitest 2.x, fast-check 3.x, attw 0.16, types/node 20.x); without this rule Dependabot opens unwanted major-bump PRs every week. The first 5 such PRs (#1–#5) were closed manually.
- GHA workflow YAML: quoted `${{ }}` template expressions inside flow-style `with: { ... }` mappings in `ci.yml` (line 54: `node-version`) and `release.yml` (line 48: `artifact-name`). Reason: YAML's flow-mapping tokenizer collides with the `${` + `{` of the template delimiter, causing both workflows to fail GHA validation in 0s. The locked plan's verbatim YAML was invalid.

### Plan deviations
- **v3 plan correction (Phase 5 Task 25 onwards)**: per-class `deserialize.ts`
  runs `findFirstEmptyArray` BEFORE Zod (was post-Zod in the v3 template).
  Reason: harness `emptyArrayField` invocation expects `cardinality_violation`
  for `[]` injected into a single-IRI field whose schema is `safeIri().optional()`.
  Post-Zod placement is unreachable because Zod emits `zod_validation` first.
  Pre-Zod placement matches the spec's "reject empty arrays on the wire" intent
  and works regardless of the field's declared schema type.

### Known gaps to resolve before v0.1.0 release tag
- Commit signing (`git commit -S`) currently suspended (Tasks 1–8 commits are unsigned). Re-enable: configure SSH or GPG signing key + `git config commit.gpgsign true` + `tag.gpgsign true`. `release.yml` signed-tag verify is the release gate.
- `release.yml` step `Verify signed tag` (`git tag -v`) requires the maintainer GPG public key in the runner keyring. No `gpg --import` step is wired in yet — first release run will fail at tag verification on a cold runner. Add a `gpg --import` step that pulls the public key from a GitHub secret (`secrets.MAINTAINER_GPG_PUBLIC_KEY`) before `git tag -v`. Pair with the signing-key setup above.
- Repository visibility: PRIVATE. Flip to PUBLIC before v0.1.0 tag for Bun git-URL install by consumers (Tracks B + C). Apache 2.0 + git-URL distribution model.
- `SECURITY.md` "Supply chain" section currently flags signing as suspended; revert to unconditional once signing resumes. Same applies to the qualifier in the "Maintainer signing key" section.
- `SECURITY.md` `security@flaks.io` disclosure address is a placeholder — the `flaks.io` domain has no verified MX record at scaffold time. Before flipping the repo public, replace with either a maintained address or a GitHub Private Vulnerability Reporting URL (`https://github.com/tjo099/onerecord-mapper/security/advisories/new`).

### Feature changes
(To be filled in during Phase 17.)

---

## Ontology version pins

- Cargo data model: **3.2** (2025-07 endorsed standard)
- API spec: **2.2.0**
