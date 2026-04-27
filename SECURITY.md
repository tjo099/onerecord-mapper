# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |
| < 0.1 | No |

## Reporting a vulnerability

Please report security issues privately via [GitHub Private Vulnerability
Reporting](https://github.com/tjo099/onerecord-mapper/security/advisories/new).
Prefix the title with `[onerecord-mapper]`. Do not open a public issue for
security-impacting bugs.

We aim to acknowledge within 72 hours and ship a fix or mitigation within
30 days for critical findings. Embargoed disclosure timelines will be
coordinated with reporters as part of the advisory thread.

## Maintainer signing key

All release tags from v0.1.0 onward will be GPG-signed (see "Supply chain" below for current 0.0.x scaffold status). Verify a signed release with:

```bash
gh release view v0.1.0 --json tagName,assets
git verify-tag v0.1.0
```

GPG fingerprint: `8033 2600 17B9 BAE5 BAD9  CA15 55BA BA8E ED15 8AD1`

Key ID: `ed25519/55BABA8EED158AD1` (long), `ED158AD1` (short).
Created 2026-04-27, expires 2028-04-26 (rotated before expiry).
UID: `tjo099 <tjo099@gmail.com>`.

Fetch and verify the maintainer public key (canonical source is the
maintainer's GitHub profile):

```bash
curl -fsSL https://github.com/tjo099.gpg | gpg --import
gpg --fingerprint 8033260017B9BAE5BAD9CA1555BABA8EED158AD1
# expect: 8033 2600 17B9 BAE5 BAD9  CA15 55BA BA8E ED15 8AD1
```

Then verify a release tag with `git tag -v vX.Y.Z`.

## Supply chain

- All commits to `main` are intended to be GPG-signed (status: temporarily suspended during 0.0.x prerelease scaffold; see CHANGELOG. Will be re-enabled before v0.1.0 release tag).
- Dependencies are audited via `bun audit` + OSV-Scanner on every PR.
- SBOM (`syft`) is attached to every release starting v0.1.0.
- SLSA provenance attestations are generated on release.
- `.npmrc` and `bunfig.toml` set `ignore-scripts=true`.
- Public API surface verified via attw (arethetypeswrong) on every PR.
