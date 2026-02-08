# Markbind PR Classification Rules

## Purpose Checklist Rules
- **Documentation update**: Check ONLY if `docs/` folder contains diffs.
- **Feature Addition**: Check ONLY if the **Deep Diff Analysis** & **Information Gathering** corresponds to one of the following.
    - Creation of new logic is added to files within the `packages/` directory (specifically **NOT refactored or fixed logic.**).
- **Bug fix**: Check ONLY if the **Deep Diff Analysis** & **Information Gathering** suggest that changes in the `packages/` logic suggests a correction and more robust logic handling.
- **Developer Experience**: Check ONLY if changes are refactors improving code quality, CI/CD, or internal dev-tooling.
- If it doesn't fit the main categories, use the **Others** box and provide a 1-sentence explanation.

## Final Checklist Section
- **Updated documentation**: Check if `docs/` is modified.
- **Added tests**: Check if `test/` or `spec/` files are modified.
- **Linked issues**: Check if an Issue ID was found and linked in the body.
- **No unrelated changes**: Check after verifying the diff doesn't contain stray edits.