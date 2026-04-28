# Maintenance

This document is for maintainers (current and future). It documents
the recurring operational tasks that keep `@flaks/onerecord` healthy.

## Signing key

- Master key: `ed25519/55BABA8EED158AD1`
- Fingerprint: `8033 2600 17B9 BAE5 BAD9 CA15 55BA BA8E ED15 8AD1`
- Created: 2026-04-27, expires 2028-04-26
- Public key: `https://github.com/tjo099.gpg`
- Revocation cert: `~/.gnupg/openpgp-revocs.d/8033260017B9BAE5BAD9CA1555BABA8EED158AD1.rev`
  (backed up offline; see Task 0.3 in v0.2.0 plan)

## Release playbook

1. Pre-flight: `bun run test && bun run lint && bun run typecheck`.
2. Verify `dist/` is fresh: `bun run build`.
3. `npm publish --dry-run --access public` — inspect tarball.
4. Test install in clean dir:
   `cd /tmp && rm -rf test && mkdir test && cd test && bun init -y && bun add @flaks/onerecord` —
   then `import('@flaks/onerecord')` should succeed.
5. `npm publish --access public` (with `--otp` if 2FA prompts).
6. Wait for npm registry CDN propagation (~30s-3min):
   `until npm view @flaks/onerecord@<NEW> version; do sleep 5; done`.
7. Update `CHANGELOG.md` with the release entry.
8. Commit + signed tag: `git tag -s -m "v<X.Y.Z> — <subject>" v<X.Y.Z>`.
9. Push: `git push origin main && git push origin v<X.Y.Z>`.
10. Verify `release.yml` runs end-to-end: `gh run list --workflow=release.yml --limit=1`.

## NPM credentials

- 2FA enabled (security-key passkey via Windows Hello).
- Granular access tokens generated per-publish, scoped to `@flaks/*`,
  bypass-2FA enabled, 7-day expiry. Revoke after use.
- Token storage: never in `.npmrc` long-term; pass inline as
  `--//registry.npmjs.org/:_authToken=...` to `npm publish`.

## Bus factor

Currently solo-maintained. v0.3+ candidate task: invite co-maintainer
once external traction justifies. See docs/roadmap.md.
