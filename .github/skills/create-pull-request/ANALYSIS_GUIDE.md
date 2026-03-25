# Deep Diff Analysis Rubric

## 1. File Linkage Patterns
- **Package Logic**: Changes in `packages/*/src` should usually be paired with changes in `packages/*/test`.
- **Documentation**: Logic changes that affect user-facing features **must** have corresponding updates in `docs/` or `_markbind/`.
- **Dependency Changes**: Changes to `package.json` require a review of `package-lock.json` and a check for unused imports in `.js/.ts` files.

## 2. Change Classification
- **Bug Fix**: Look for evidence of error handling, edge case management, or logic correction.
- **Feature**: Look for new exported constants, classes, or public methods.
- **Refactor**: Changes that modify structure/readability without changing external behavior.