# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |
| < 0.1 | No |

## Reporting a vulnerability

Email security disclosures to **security@flaks.io** with subject
prefix `[onerecord-mapper]`. Encrypt with the maintainer GPG key
fingerprint published below.

We aim to acknowledge within 72 hours and ship a fix or mitigation
within 30 days for critical findings.

## Maintainer signing key

All release tags from v0.1.0 onward will be GPG-signed (see "Supply chain" below for current 0.0.x scaffold status). Verify a signed release with:

```bash
gh release view v0.1.0 --json tagName,assets
git verify-tag v0.1.0
```

GPG fingerprint: `<TO BE FILLED IN BY MAINTAINER BEFORE FIRST RELEASE>`

## Supply chain

- All commits to `main` are intended to be GPG-signed (status: temporarily suspended during 0.0.x prerelease scaffold; see CHANGELOG. Will be re-enabled before v0.1.0 release tag).
- Dependencies are audited via `bun audit` + OSV-Scanner on every PR.
- SBOM (`syft`) is attached to every release starting v0.1.0.
- SLSA provenance attestations are generated on release.
- `.npmrc` and `bunfig.toml` set `ignore-scripts=true`.
- Public API surface verified via attw (arethetypeswrong) on every PR.
