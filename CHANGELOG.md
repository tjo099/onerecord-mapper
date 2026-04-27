# Changelog

All notable changes are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/) per the policy in `MIGRATING.md`.

## [Unreleased] (0.0.x prerelease scaffold)

### Build / dev environment changes (vs locked plan)
- Bun pin: `engines.bun` set to `1.3.x` (plan was `1.1.x`); CI `bun-version: '1.3.11'`. Reason: local toolchain is 1.3.11.
- `xlsx` devDep pinned to `^0.18.5` (plan was `^0.20.0`). Reason: 0.20.x is SheetJS Pro CDN-only, not public npm.

### Known gaps to resolve before v0.1.0 release tag
- Commit signing (`git commit -S`) currently suspended (Tasks 1–8 commits are unsigned). Re-enable: configure SSH or GPG signing key + `git config commit.gpgsign true` + `tag.gpgsign true`. `release.yml` signed-tag verify is the release gate.
- Repository visibility: PRIVATE. Flip to PUBLIC before v0.1.0 tag for Bun git-URL install by consumers (Tracks B + C). Apache 2.0 + git-URL distribution model.
- `SECURITY.md` "Supply chain" section currently flags signing as suspended; revert to unconditional once signing resumes. Same applies to the qualifier in the "Maintainer signing key" section.
- `SECURITY.md` `security@flaks.io` disclosure address is a placeholder — the `flaks.io` domain has no verified MX record at scaffold time. Before flipping the repo public, replace with either a maintained address or a GitHub Private Vulnerability Reporting URL (`https://github.com/tjo099/onerecord-mapper/security/advisories/new`).

### Feature changes
(To be filled in during Phase 17.)

---

## Ontology version pins

- Cargo data model: **3.2** (2025-07 endorsed standard)
- API spec: **2.2.0**
