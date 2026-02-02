# Git Hooks in MarkBind

MarkBind uses the [pre-commit](https://pre-commit.com/) framework to manage git hooks.

## Available Hooks

### post-checkout
**When**: After checking out a branch
**Actions**:
- Runs `npm run clean`
- Builds backend with `npm run build:backend`

**Purpose**: Ensures compiled backend matches the checked-out code version.

**Note**: Can slow down branch switching. Skip occasionally with `git checkout --no-verify` if needed.

### pre-commit
**When**: Before creating a commit
**Actions**:
- Runs `npm run clean`
- Builds backend with `npm run build:backend`
- Runs `npm run lintfix` on staged files

**Purpose**: Ensures commits include compiled backend and pass linting checks.

**Skip with**: `git commit --no-verify`

### pre-push
**When**: Before pushing to remote
**Actions**:
- Runs `npm run clean`
- Builds backend with `npm run build:backend`
- Runs full test suite with `npm run test`

**Purpose**: Catches issues before they reach the remote repository.

**Skip with**: `git push --no-verify`

**Note**: This is the slowest hook. Consider skipping if you've already run tests manually.

## Hook Configuration

Hooks are configured in `.pre-commit-config.yaml` at the project root.

Scripts are located in `./pre-commit/pre-commit-scripts/`.

## Installation

Install hooks during initial setup:
```bash
python3 ./pre-commit/pre-commit-2.20.0.pyz install
```

## Uninstallation

Remove hooks if they become problematic:
```bash
python3 ./pre-commit/pre-commit-2.20.0.pyz uninstall
```

## When to Skip Hooks

### Skip pre-commit
- Emergency hotfix commits
- WIP commits for backup purposes
- When lintfix has already been run manually

### Skip pre-push
- Tests already passed locally
- Pushing to personal fork for backup
- Quick iteration during development

### Skip post-checkout
- Rapidly switching between branches
- Checking out for quick reference
- When backend compilation isn't needed

## Best Practices

### Generally Keep Hooks Enabled
- Catches errors early
- Ensures code quality
- Prevents broken commits from reaching CI

### Use --no-verify Judiciously
- Don't make it a habit
- Always run tests before creating PRs
- Fix issues rather than bypassing checks

### Manual Equivalents

Instead of skipping hooks, run commands manually:

```bash
# Instead of skipping pre-commit
npm run lintfix
git commit

# Instead of skipping pre-push
npm run test
git push --no-verify  # Safe now since tests passed
```

## Troubleshooting

### Hooks Not Running
- Verify hooks are installed: `ls -la .git/hooks/`
- Reinstall: `python3 ./pre-commit/pre-commit-2.20.0.pyz install`

### Hooks Failing
- Check Python version: `python3 -V` (need 3.x)
- Check error messages for specific issues
- Try manual commands to isolate problems

### Hooks Too Slow
- Skip post-checkout if branch switching is frequent
- Run tests manually before pushing, then skip pre-push hook
- Consider disabling hooks during rapid prototyping

### Hook Conflicts with TypeScript Migration
For TypeScript migration "Rename" commits that don't compile:
```bash
git commit --no-verify -m "Rename core/src/html to TypeScript"
```

The "Adapt" commit should compile and can use normal commit.
