# Release and adoption of 0.5.0

Version 0.5.0 is the shared ONE Record API 2.2.0 and cargo ontology 3.2.0
contract for Cargo ERP, Skidd and Booking Portal. A signed version tag now
publishes the package automatically through GitHub Actions and npm trusted
publishing.

## One-time npm setup

An npm package owner must authorize the workflow once in the
`@flaks/onerecord` package settings:

- Publisher: GitHub Actions
- Organization or user: `tjo099`
- Repository: `onerecord-mapper`
- Workflow filename: `release.yml`
- Environment: leave empty
- Allowed action: `npm publish`

The values are case-sensitive. Enter only `release.yml`, not the
`.github/workflows/` path. Do not create an npm automation token or add an
`NPM_TOKEN` GitHub secret; the workflow uses short-lived OIDC credentials.

Alternatively, with npm CLI 11.15 or newer and an interactively authenticated
package-owner session, the same relationship can be created with:

```powershell
npm trust github @flaks/onerecord `
  --repo tjo099/onerecord-mapper `
  --file release.yml `
  --allow-publish
```

After the first successful trusted publish, set package publishing access to
**Require two-factor authentication and disallow tokens**, then revoke obsolete
write-capable automation tokens.

## Release gate

Pull requests and local release preparation should run:

```powershell
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run test:property
bun run build
bun run api:check
npm pack --dry-run
```

The tag workflow repeats these gates, verifies that the signed tag matches
`package.json`, verifies that the tagged commit is on `main`, inspects the npm
archive, creates the GitHub release, and publishes to npm. Create and push the
release tag only after the release commit is merged:

```powershell
git switch main
git pull --ff-only
git tag -s v0.5.0 -m "Release @flaks/onerecord 0.5.0"
git push origin v0.5.0
```

The workflow is safe to rerun after a partial GitHub Actions failure: it skips
the npm publish step when the exact immutable version already exists. Never
reuse a version for different content; increment the patch version instead.

Verify the result:

```powershell
npm view @flaks/onerecord@0.5.0 version
npm view @flaks/onerecord@0.5.0 dist.integrity
npm pack @flaks/onerecord@0.5.0
```

## Application adoption

After the package is visible on the registry:

1. Pin Cargo ERP, Skidd and Booking Portal to the same exact package version.
2. Replace locally repeated API constants and peer-profile validators with
   imports from `@flaks/onerecord/api`.
3. Keep application-specific projection and persistence code in each product;
   the mapper owns only ontology/API wire contracts and transformations.
4. Run each API's typecheck and ONE Record contract suite.
5. Deploy database migrations before application code, configure asymmetric
   signing keys and previous-key overlap, then run the standards-only peer
   smoke test before enabling traffic.

The applications must not depend on a sibling checkout or a `file:` package in
production. That would prevent each product from building and deploying on its
own.
