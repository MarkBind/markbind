# Release Procedures

Complete step-by-step guide for releasing new MarkBind versions.

## Prerequisites

### Required Permissions

**GitHub**:
- Push to master branch
- Create releases
- Check: "Draft a new release" button visible at [releases page](https://github.com/MarkBind/markbind/releases)

**npm**:
- Member of [MarkBind organization](https://www.npmjs.com/org/markbind)
- Check: MarkBind listed under organizations in npm profile

**Published Packages**:
- `markbind-cli`
- `@markbind/core`
- `@markbind/core-web`
- `@markbind/vue-components` (private, internal use)

### Environment Setup

1. **npm login**:
   ```bash
   npm login
   ```

2. **Clean state**:
   ```bash
   npx lerna clean
   npm run setup
   ```

## Step 1: Version Increment

### Determine Version Type

Review merged PRs with version labels:
- `r.Major` - Breaking changes → Increment major (1.x.x → 2.0.0)
- `r.Minor` - New features → Increment minor (1.2.x → 1.3.0)
- `r.Patch` - Bug fixes → Increment patch (1.2.3 → 1.2.4)

Follow [Semantic Versioning](https://semver.org/).

### Increment Version

```bash
npx lerna version --no-push --exact
```

**Flags**:
- `--no-push`: Don't push yet (we'll add more changes)
- `--exact`: Use exact versions (not semver ranges)

**What it does**:
- Updates version in all `package.json` files
- Creates version commit
- Creates version tag (e.g., `v1.2.3`)

**Important**: Don't push yet.

## Step 2: Build Frontend Bundles

```bash
npm run build:web
```

**What it does**:
- Builds `markbind.min.js`
- Builds `markbind.min.css`
- Builds `vuecommonappfactory.min.js`
- Builds `vuecommonappfactory.min.css`

### Verify Bundle Changes

Check git diff for bundles in `packages/core-web/dist/`:

**Expected**:
- Version numbers updated
- New features reflected in code
- Reasonable size changes

**Unexpected** (investigate):
- Massive size increase
- Strange code patterns
- Missing features

**Note**: If no frontend changes since last release, bundles may be unchanged. This is normal.

**Font files**: If fonts appear changed but you didn't modify them, discard changes:
```bash
git checkout -- packages/core-web/dist/fonts/
```

## Step 3: Update Test Files

```bash
npm run updatetest
```

### Verify Test Changes

**Expected changes**: Only version numbers in HTML meta tags:

```diff
-    <meta name="generator" content="MarkBind 1.20.0">
+    <meta name="generator" content="MarkBind 1.21.0">
```

**Unexpected changes**: Other lines changed
- **Problem**: Functional tests weren't updated in earlier PRs
- **Solution**: Revert everything, fix tests in separate PR first

### Verify Bundle Copies

If frontend bundles were updated, check they're copied to test sites:

```bash
git status packages/cli/test/functional/*/expected/markbind/
```

Should show updated bundles in all test site `expected/` directories.

## Step 4: Combine Commits

Amend the version commit to include bundle and test updates:

```bash
# Stage all changes
git add .

# Amend version commit (replace vX.Y.Z with actual version)
git commit --amend --reuse-message=vX.Y.Z

# Update tag to point to amended commit
git tag --force vX.Y.Z
```

**Result**: Single commit with version bump + bundles + tests.

## Step 5: Push

```bash
# Push commit (replace 'upstream' with your remote name if different)
git push upstream master

# Push tag (replace vX.Y.Z with actual version)
git push upstream vX.Y.Z
```

## Step 6: Publish to npm

```bash
npx lerna publish from-git
```

**What it does**:
- Detects tag from git
- Publishes all packages with new version
- Only publishes public packages (not vue-components)

**Verify success**: Check npm output for success messages.

## Step 7: Smoke Test

Test the published version:

```bash
# Install globally
npm i -g markbind-cli@X.Y.Z

# Test commands
markbind init test-site
cd test-site
markbind serve
markbind build
```

**Test checklist**:
- [ ] Init creates site correctly
- [ ] Serve works without errors
- [ ] Build generates output
- [ ] Frontend components work
- [ ] No console errors
- [ ] Styles load correctly

**Important**: Test on clean environment (not using `npm link`).

**Recommendation**: Test on different platform/computer to ensure it works for end users.

## Step 8: Verify Website Deployment

Check [markbind.org](https://markbind.org):

1. Open in **incognito window** (avoid cache)
2. Check footer shows new version number
3. Verify pages load correctly
4. Test search functionality

**Note**: May take a few minutes to update.

### Manual Deployment (if automated fails)

```bash
npm run deploy:ug
```

Check CI/CD logs if deployment issues persist.

## Step 9: GitHub Release

### Create Release

1. Go to [releases page](https://github.com/MarkBind/markbind/releases)
2. Click "Draft a new release"
3. Enter tag: `vX.Y.Z` (should show "Existing tag")
4. Leave title blank (GitHub uses tag)
5. Click "Generate release notes" for auto-generated PR list

### Format Release Notes

Use this template:

```markdown
# markbind-cli

## User Facing Changes

### Breaking Changes

> **Change**: Description of what changed
> 
> **Migration**: Steps to update existing sites
> 
> Example:
> ```markdown
> <!-- Old -->
> <panel header="Title">
> 
> <!-- New -->
> <panel heading="Title">
> ```

### Features

- Add feature X (#123)
- Support for Y (#456)

### Enhancements

- Improve Z performance (#789)
- Better error messages for W (#012)

### Fixes

- Fix A not working (#345)
- Resolve B issue (#678)

### Documentation

- Update C documentation (#901)
- Add examples for D (#234)

## Developer Facing Changes

### Code Quality

- Refactor E module (#567)
- Extract F utility (#890)

### DevOps Changes

- Update CI pipeline (#123)
- Improve build process (#456)

### Dependencies

- Update G to v2.0 (#789)
- Bump H from 1.0 to 1.1 (#012)

### Miscellaneous

- Other changes (#345)
```

### Categorize PRs

Review each PR in generated list:
1. Move to appropriate section
2. Summarize clearly
3. Include PR number
4. Add author credit
5. Remove empty sections

### Breaking Changes Detail

For breaking changes, provide:
- What changed and why
- Old vs new behavior
- Migration steps with examples
- Links to relevant docs

**Example** (from v1.18.0):

```markdown
### Breaking Changes

#653 Disable decamelize for anchor ID generation (#667)

> Headings with PascalCase wordings now generate different anchor IDs
> to match GitHub Flavored Markdown.
>
> **Example**:
> ```markdown
> # MarkBind docs
> ```
>
> Old anchor: `mark-bind-docs`  
> **New anchor**: `markbind-docs`
>
> **Migration**: Update internal links to use new anchor format.
```

### Review and Publish

1. Preview release notes
2. Verify all PRs categorized
3. Check breaking changes have migration guides
4. Click "Publish release"

## Step 10: Announce

Post to Slack channel:

```
Published: npm i -g markbind-cli@X.Y.Z

Release notes: https://github.com/MarkBind/markbind/releases/tag/vX.Y.Z
```

## Troubleshooting

### npm Publish Fails

**Check permissions**:
```bash
npm whoami
npm org ls markbind
```

**Verify version not already published**:
```bash
npm info markbind-cli versions
```

**Re-publish if needed**:
```bash
npx lerna publish from-git
```

### Website Doesn't Update

1. Wait 5-10 minutes
2. Check in incognito window
3. Check CI/CD logs
4. Manually deploy: `npm run deploy:ug`
5. Check for errors in build logs

### Smoke Test Fails

**If critical issue**:
1. Don't announce release
2. Fix issue quickly
3. Publish patch version
4. Test again
5. Announce when working

**If minor issue**:
1. File issue
2. Fix in next release
3. Document known issue in release notes

### Version Tag Conflict

If tag already exists:
```bash
# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag (careful!)
git push origin :refs/tags/vX.Y.Z

# Recreate correctly
git tag vX.Y.Z
git push upstream vX.Y.Z
```

### Wrong Version Published

**Can't unpublish** recent versions (npm policy).

**Solution**: Publish hotfix patch version immediately:
1. Increment patch: `npx lerna version patch --no-push --exact`
2. Fix issue
3. Follow release process
4. Deprecate bad version: `npm deprecate markbind-cli@X.Y.Z "Use X.Y.Z+1 instead"`

## Post-Release Checklist

- [ ] Version published to npm
- [ ] GitHub release created with notes
- [ ] Website updated with new version
- [ ] Smoke test passed
- [ ] Announcement posted
- [ ] No critical issues reported
- [ ] Documentation up to date

## Release Schedule

No fixed schedule, but considerations:

**Good times to release**:
- After significant features merged
- Security fixes (as soon as possible)
- Accumulated bug fixes (every 2-4 weeks)

**Avoid releasing**:
- Right before holidays
- Friday afternoons (less time to fix issues)
- During exams (if maintainers are students)

## Version Numbering Examples

| Current | Change Type | New Version |
|---|---|---|
| 1.2.3 | Bug fix | 1.2.4 |
| 1.2.3 | New feature | 1.3.0 |
| 1.2.3 | Breaking change | 2.0.0 |
| 2.0.0 | Bug fix | 2.0.1 |
| 2.0.0 | New feature | 2.1.0 |

## Common Mistakes to Avoid

- [ ] Forgetting to build frontend bundles
- [ ] Not updating test files
- [ ] Pushing before combining commits
- [ ] Not testing before announcing
- [ ] Incomplete release notes
- [ ] Missing migration guides for breaking changes
- [ ] Not checking website deployment
- [ ] Announcing before smoke test

## Timeline Estimate

- **Preparation**: 10 minutes
- **Version + build + test**: 15 minutes
- **Push + publish**: 5 minutes
- **Smoke test**: 10 minutes
- **Release notes**: 20-30 minutes
- **Verification**: 5 minutes
- **Total**: ~1 hour (more if many PRs to categorize)

## Getting Help

If stuck:
- Check previous releases for examples
- Ask in maintainers channel
- Review this guide carefully
- Don't rush - better to take time than release broken version
