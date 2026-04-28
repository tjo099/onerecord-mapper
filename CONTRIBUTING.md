# Contributing to @flaks/onerecord

Thanks for considering a contribution. This is the reference TypeScript
mapper for the IATA OneRecord cargo data model 3.2 and API spec 2.2.0.
Contributions that improve spec conformance, harden the safety primitives,
or extend test coverage are especially welcome.

## Reporting issues

- **Bug reports**: open a GitHub issue using the bug report template.
  Include a minimal reproduction, the OneRecord spec reference (section
  number), and your Bun/Node version.
- **Feature requests**: open a GitHub issue using the feature request
  template.
- **Security vulnerabilities**: do NOT open a public issue. Use
  [GitHub Private Vulnerability Reporting](https://github.com/tjo099/onerecord-mapper/security/advisories/new).
  See [SECURITY.md](SECURITY.md) for details.

## Development setup

Requires Bun `1.3.x` and Node `>=20`.

```bash
bun install
bun run test       # vitest, ~528 tests
bun run lint       # Biome
bun run typecheck  # tsc --noEmit
bun run audit      # bun audit + osv-scanner
```

## Pull request workflow

1. Fork and create a feature branch from `main`.
2. Keep PRs focused — one logical change per PR.
3. Add tests. New behavior needs new tests; bug fixes need regression tests.
4. Run the full local quality gate before pushing:
   `bun run test && bun run lint && bun run typecheck`
5. Update `CHANGELOG.md` under the `[Unreleased]` section.
6. **Sign your commits** (see "Commit signing" below). Unsigned commits will
   be rejected by the release workflow.
7. Open a PR using the template. CI must pass before review.

## Commit signing

All commits and tags from v0.2.0 onward must be GPG- or SSH-signed:

```bash
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

See GitHub's guide on
[signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).
Pull requests with unsigned commits will be asked to rebase with signing
enabled.

## Code style

- TypeScript with `exactOptionalPropertyTypes`. New code should use the
  `parse-utils.ts` helpers (`toPreValidateOpts`, `toContextOpts`) for
  conditional-spread patterns rather than inlining the spread.
- Biome handles formatting and linting. Run `bun run lint:fix` to auto-fix.
- No new runtime dependencies without prior discussion. Zod is the only
  allowed runtime dependency.
- Public API additions must update the API surface snapshot test.

## Spec compliance

If your change touches OneRecord spec semantics:

- Reference the spec section in your PR description (e.g. "data model
  §3.2.4" or "API spec §6.5").
- Add or update a fixture in `test/fixtures/iata/`.
- If the change deliberately deviates from the spec, document the deviation
  in `CHANGELOG.md` under "Plan deviations" with reasoning.

## Running contract tests locally

Contract tests at `test/contract/` exercise the library against the
**OLF-hosted reference NE:ONE Server** (the IATA OneRecord reference
implementation). They verify our wire format actually round-trips
through a real server, not just our own codecs.

These tests are **excluded from the default `bun run test` run** (network
dependency). Run them explicitly with `bun run test:contract` after
bringing up the local NE:ONE stack.

**Stack setup** (one-time): clone the upstream NE:ONE repository, then
bring up the multi-service stack. The develop branch's base
`docker-compose.yml` has three undocumented gaps (Keycloak hostname/port
plumbing, Redis service definition, OIDC issuer/JWKS URLs); the working
overlay is `docker-compose.fix-oidc.yml`. Stack composition:

```bash
git clone https://git.openlogisticsfoundation.org/wg-digitalaircargo/ne-one.git
cd ne-one
docker compose \
  -f src/main/docker-compose/docker-compose.yml \
  -f src/main/docker-compose/docker-compose.graphdb-server.yml \
  -f src/main/docker-compose/docker-compose.graphdb.yml \
  -f src/main/docker-compose/docker-compose.minio.yml \
  -f src/main/docker-compose/docker-compose.mockserver.yml \
  -f src/main/docker-compose/docker-compose.keycloak.yml \
  -f src/main/docker-compose/docker-compose.fix-oidc.yml \
  up -d
```

**Service URLs** (defaults; override via env vars):
- NE:ONE API: `http://localhost:8080` (`NEONE_URL`)
- Keycloak: `http://localhost:8989` (`NEONE_KEYCLOAK_URL`, `NEONE_REALM=neone`)
- OIDC client credentials: `neone-client` / well-known dev secret
  (`NEONE_CLIENT_ID`, `NEONE_CLIENT_SECRET`)

**Wire-format adapter**: `test/contract/_neone-client.ts` translates
between our 3.2 envelope (`@context` string, `@type` literal, client-minted
`@id`) and NE:ONE's accepted shape (`@context` object form, `@type` array
including `LogisticsObject`, server-assigned `@id`). It also defensively
wraps OWL ObjectProperty values, code-list values, and xsd literals per
the gotchas catalog at the top of the file. Tests skip cleanly via
`it.skipIf(!stackUp)` when the stack is unreachable.

**CI integration**: contract tests are not run in CI in v0.2.0 — bundling
the multi-service stack for headless GitHub Actions runners is non-trivial
and is deferred to v0.3. Run them manually before tagging a release.

## Versioning

This project follows [SemVer](https://semver.org/) per the policy in
[MIGRATING.md](MIGRATING.md). Breaking API changes require a major
version bump.

## License

By contributing you agree your contributions are licensed under the
[Apache License 2.0](LICENSE).
