# Releasing Monoline

Three packages are published from this repo, always at the same version:

| Package | Folder | Install |
|---|---|---|
| `@monoline/css` | `packages/css` | `npm i @monoline/css` |
| `@monoline/react` | `packages/react` | `npm i @monoline/react` |
| `monoline` (CLI) | `packages/cli` | `npx monoline add button` |

Nothing has been published yet. The packages are already at `0.3.0`, so the first release is `0.3.0` with no bump.

Everything below runs from the repo root. `scripts/release.mjs` does the checking and the publishing; `.github/workflows/release.yml` runs the same steps in CI.

## 1. Check the names

```bash
npm view @monoline/css version
npm view @monoline/react version
npm view monoline version
npm view @monoline version 2>&1 | head -1
```

A `404 Not Found` means the name is free. A version number means someone already has it.

Also open `https://www.npmjs.com/org/monoline`. A 404 page there means the `@monoline` scope is free to create.

## 2. If `@monoline` is taken

Pick the fallback before you publish anything. Renaming after publish is worse than renaming now.

1. Choose a scope that is free. Check it with `npm view @<scope>` and `https://www.npmjs.com/org/<scope>`. Examples: `@monoline-ui`, `@monolinekit`.
2. Rename the packages in one pass, then check nothing still uses the old scope:

   ```bash
   grep -rln "@monoline/" --exclude-dir=node_modules --exclude-dir=dist . | grep -v package-lock.json
   ```

   Update each `name`, the internal `dependencies` and `devDependencies` names, the README install lines, `apps/docs` text and `registry/` (regenerate it with `npm run registry`). Then run `npm run check`.
3. If only the unscoped `monoline` name is taken, rename the CLI package to `@monoline/cli` (or `@<scope>/cli`) and keep the `bin` name `monoline`. Users then run `npx @monoline/cli add button`, and the README and CLI help text must say so.

Commit the rename before the first publish. It is a one-time change.

## 3. npm account, 2FA and the organisation

1. Create an account at https://www.npmjs.com/signup, or sign in with the owner's account.
2. Turn on two-factor authentication: profile → Account → Two-Factor Authentication → set to **Authorization and writes**. Keep the recovery codes somewhere safe.
3. Create the organisation: https://www.npmjs.com/org/create. Name it `monoline` (or the fallback scope). Choose the free plan: public packages are free.
4. Log in on the machine that will publish:

   ```bash
   npm login --auth-type=web
   npm whoami
   ```

   `npm whoami` must print the account name. The publish script refuses without it.

## 4. Token for CI

CI publishes with a token, so 2FA codes are not needed there.

1. https://www.npmjs.com/settings/<your-username>/tokens → Generate new token → **Granular access token** (or "Automation" if granular is not offered).
   - Permissions: read and write.
   - Packages and scopes: `@monoline` (or the fallback scope) and `monoline` if the CLI keeps the unscoped name.
   - Expiry: 90 days or less. Put a reminder in the calendar.
2. In GitHub: repository → Settings → Secrets and variables → Actions → New repository secret. Name `NPM_TOKEN`, value the token.
3. Optional but recommended: repository → Settings → Environments → New environment named `release`. Add yourself as a required reviewer, so every publish waits for an approval click. The workflow already uses this environment.

Never paste the token into a file, a chat or a commit. The workflow reads it from the secret.

## 5. Commit the release state

```bash
node scripts/release.mjs check
```

`check` copies `LICENSE` into any package that lacks one. Commit those copies with the rest of the release work. A real publish refuses while the working tree is dirty.

Make sure the build is current first, because `check` looks at `dist/`:

```bash
npm ci
npm run check
npm run build
npm run size
npm run test:cli
npm run test:release
node scripts/release.mjs check
```

Every line must pass. `check` prints the size and file list of each tarball. Read the list once: nothing from `test/`, `*.test.*`, `*.demo.*` or `scripts/` should be in it.

## 6. Dry run

```bash
node scripts/release.mjs publish --dry-run
```

This runs `npm publish --dry-run --access public` for each package, in dependency order (`@monoline/css`, then `@monoline/react`, then `monoline`). It uploads nothing. The output ends with `publish dry run passed` when all three work.

## 7. Publish 0.3.0

Choose one of two paths.

**A. Through CI (recommended).** It publishes with provenance, so each package shows where it was built.

1. Merge the release commit to `master`.
2. GitHub → Actions → **release** → Run workflow. Version: `0.3.0`.
3. Approve the `release` environment if you set up reviewers.
4. The run checks, builds, tests, dry-runs, publishes, then creates the `v0.3.0` tag and the GitHub release with the changelog section.

**B. From your machine (no provenance).** Use this only if CI is not set up yet.

```bash
node scripts/release.mjs publish --yes
```

npm asks for a one-time code from your authenticator app for each package. The script checks login and a clean git tree first, then publishes in order. If it stops halfway, run it again: packages already on npm are skipped. Then tag and release by hand:

```bash
git tag -a v0.3.0 -m "Monoline v0.3.0"
git push origin v0.3.0
node scripts/release.mjs notes 0.3.0 | gh release create v0.3.0 --title "Monoline v0.3.0" --notes-file -
```

## 8. Verify in a clean project

Use a new folder outside the repo, so nothing from this checkout leaks in:

```bash
dir="$(mktemp -d)" && cd "$dir" && npm init -y >/dev/null
npm install @monoline/react @monoline/css react react-dom
npm audit signatures
```

`npm audit signatures` checks the registry signatures and, for CI publishes, the provenance attestations.

Check that the packages resolve and the CSS file exists:

```bash
node --input-type=module -e "import {Button} from '@monoline/react'; console.log('react ok', typeof Button)"
node -e "console.log(require.resolve('@monoline/css/monoline.css'))"
```

Check the CLI with a fresh project:

```bash
npx --yes monoline@0.3.0 list
```

Then open the page the README shows: a file that imports `@monoline/css` and renders a `Button`, run with any bundler. If anything fails here, do not announce the release. Fix it and publish 0.3.1.

Check the registry view:

```bash
npm view @monoline/react version
npm view @monoline/react dist-tags
```

## 9. Every release after 0.3.0

```bash
node scripts/release.mjs version minor     # or patch, major, or x.y.z
```

This bumps every package to the same version, points the internal dependencies at it, and writes a new `CHANGELOG.md` section from the commit subjects since the last `v*` tag. Read the section and edit the wording if needed. It creates no tag. Then:

1. Commit (`git commit -am "release: 0.4.0"`).
2. Merge to `master`.
3. Run the **release** workflow with version `0.4.0`.

Add `--tag` to `version` only if you want the local tag now. The workflow creates the tag itself if it is missing.

## Troubleshooting

- **`npm whoami failed`**: run `npm login --auth-type=web`, or set `NODE_AUTH_TOKEN` for a CI run.
- **`git working tree is not clean`**: commit the release files (often the `LICENSE` copies).
- **`already on npm`**: expected when re-running a half-finished publish. It is skipped, not an error.
- **`dist/ is missing`**: run `npm run build` first.
- **`bin path "./bin/..." starts with "./"`**: npm's publish step silently drops that bin entry, so `npx monoline` would break. In `packages/cli/package.json` write `"bin": {"monoline": "bin/monoline.mjs"}`.
- **`is not in the tarball`**: a `files` entry in that package's `package.json` leaves out something the exports need.
- **`402 Payment Required` or `You must sign up for private packages`**: the scope was created as paid or the package is set private. Scoped packages need `"publishConfig": {"access": "public"}`, which is already in each package.
- **`EOTP` or `one-time password required`**: 2FA is on for this account. Use the code from your app, or use the CI token.
- **`E403 ... you do not have permission`**: the logged-in account is not a member of the `@monoline` org with publish rights. Check the org's members page.
