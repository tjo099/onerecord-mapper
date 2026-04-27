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

## Versioning

This project follows [SemVer](https://semver.org/) per the policy in
[MIGRATING.md](MIGRATING.md). Breaking API changes require a major
version bump.

## License

By contributing you agree your contributions are licensed under the
[Apache License 2.0](LICENSE).
