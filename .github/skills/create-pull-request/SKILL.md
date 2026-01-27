---
name: create-pull-request
description: Create a GitHub pull request following project conventions. Use when the user asks to create a PR, submit changes for review, or open a pull request. Handles commit analysis, branch management, and PR creation using the gh CLI tool.
Credit: This skill was adapted from the original `create-pull-request` skill developed by the **[Cline](https://github.com/cline/cline)** team. 
- **Original Source**: [cline/cline/.cline/skills/create-pull-request](https://github.com/cline/cline/blob/main/.cline/skills/create-pull-request/SKILL.md)
Modification: Modified to support **Fork-to-Upstream** workflows and automated upstream remote detection.
---

# Create Pull Request (Fork-to-Upstream Version)

This skill guides you through creating a well-structured GitHub pull request that follows project conventions and best practices.

## Prerequisites Check

Before proceeding, verify the following:

### 1. Check if `gh` CLI is installed

```bash
gh --version
```

If not installed, inform the user:
> The GitHub CLI (`gh`) is required but not installed. Please install it:
> - macOS: `brew install gh`
> - Other: https://cli.github.com/

### 2. Check if authenticated with GitHub

```bash
gh auth status
```

If not authenticated, guide the user to run `gh auth login`.

### 3. Verify clean working directory

```bash
git status
```

If there are uncommitted changes, ask the user whether to:
- Commit them as part of this PR
- Stash them temporarily
- Discard them (with caution)

## Gather Context

### 1. Identify the current branch

```bash
git branch --show-current
```

Ensure you're not on `main` or `master`. If so, ask the user to create or switch to a feature branch.

### 2. Identify the Upstream Remote

```bash
git remote -v
```

If 'upstream' is missing, instruct the user to add it: git remote add upstream `https://github.com/ORIGINAL_OWNER/REPO_NAME.git`

### 3. Find the base branch on Upstream

```bash
# First, get the actual owner/repo string for the upstream remote
UPSTREAM_REPO=$(git remote get-url upstream | sed 's/.*github.com[\/:]//;s/\.git$//')

# Then use that string to get the default branch
gh repo view "$UPSTREAM_REPO" --json defaultBranchRef -q .defaultBranchRef.name
```

### 4. Analyze recent commits relevant to this PR from the Upstream

```bash
git log upstream/main..HEAD --oneline --no-decorate
```

Review these commits to understand:
- What changes are being introduced
- The scope of the PR (single feature/fix or multiple changes)
- Whether commits should be squashed or reorganized

### 5. Review the diff

```bash
git diff upstream/main..HEAD --stat
```

This shows which files changed and helps identify the type of change.

## Information Gathering

Before creating the PR, you need the following information. Check if it can be inferred from:
- Commit messages
- Branch name (e.g., `fix/issue-123`, `feature/new-login`)
- Changed files and their content

If any critical information is missing, use `ask_followup_question` to ask the user:

### Required Information

1. **Related Issue Number**: Look for patterns like `#123`, `fixes #123`, or `closes #123` in commit messages
2. **Description**: What problem does this solve? Why were these changes made?
3. **Type of Change**: Bug fix, new feature, breaking change, refactor, cosmetic, documentation, or workflow
4. **Test Procedure**: How was this tested? What could break?

### Example clarifying question

If the issue number is not found:
> I couldn't find a related issue number in the commit messages or branch name. What GitHub issue does this PR address? (Enter the issue number, e.g., "123" or "N/A" for small fixes)

## Git Best Practices

Before creating the PR, consider these best practices:

### Commit Hygiene

1. **Atomic commits**: Each commit should represent a single logical change
2. **Clear commit messages**: Follow conventional commit format when possible
3. **No merge commits**: Prefer rebasing over merging to keep history clean

### Branch Management

1. **Rebase on latest main** (if needed):
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Push Changes

Ensure all commits are pushed:
```bash
git push origin HEAD
```

If the branch was rebased, you may need:
```bash
git push origin HEAD --force-with-lease
```

## Create the Pull Request

**IMPORTANT**: Read and use the PR template at `.github/PULL_REQUEST_TEMPLATE`. The PR body format must **strictly match** the template structure. Do not deviate from the template format. 

- Notify the user if the PR template missing before asking if they would like to proceed.

When filling out the template:
1. **Purpose Checklist**: Based on the file changes detected check the relevant boxes under **"What is the purpose of this pull request?"**. 
   - Check **Documentation update** ONLY if files within the `docs/` directory were modified.
   - Check **Feature addition or enhancement** if new logic is added to `src/` or core components.
   - Check **Bug fix** if the commit messages or code diff indicate a correction.
   - If it doesn't fit the main categories, use the "Others" box and provide a 1-sentence explanation.
   - **Linking Issues**: Search for issue numbers in your commits. If found, use keywords like "Fixes #123" or "Resolves #123" in the comment block provided.

2. **Overview of changes**: Provide a high-level, 1-2 sentence summary of what this PR achieves.
   - **Mandatory Note**: Append this exact line to the end of this section: This PR was generated using the `create-pull-request` skill. 

3. **Highlight/Discuss**: Elaborate on the technical implementation. Explain *how* you changed the code or documentation and point out any specific logic or layout choices you want the reviewer to notice.

4. **Testing instructions**: Identify any manual testing steps. 
   - *Example: "Run `markbind serve`, navigate to /docs/plugin, and verify the new warning component renders correctly."*
   - If no special steps are needed beyond automated tests, leave this blank or state "No special instructions."

5. **Proposed commit message**: Generate a high-quality commit message:
   - **Title**: Maximum 50 characters.
   - **Body**: Wrap lines at 72 characters.
   - Follow the [SE-Education standards](https://se-education.org/guides/conventions/git.html) referenced in the template.

6. **Checklist**: Analyze the changes to check the appropriate boxes:
   - Check "Updated documentation" ONLY if changes are detected in the `docs/` folder.
   - Check "Added tests" if files in `test` or `spec` files were add or modified.
   - Check "Linked all related issues" if you identified an issue number.
   - Check "No unrelated changes" after verifying the diff doesn't contain stray edits.

7. **Reviewer Section**: Leave the **Reviewer checklist** and **SEMVER** sections **unchecked** and unmodified. These are for the maintainers to fill out during review.

### Create PR with gh CLI

```bash
gh pr create --repo upstream_owner/repo_name --base main --head your_username:your_branch --title "PR_TITLE" --body "PR_BODY"
```

Alternatively, create as draft if the user wants review before marking ready:
```bash
gh pr create --title "PR_TITLE" --body "PR_BODY" --base main --draft
```

## Post-Creation

After creating the PR:

1. **Display the PR URL** so the user can review it
2. **Remind about CI checks**: Tests and linting will run automatically
3. **Suggest next steps**:
   - Add reviewers if needed: `gh pr edit --add-reviewer USERNAME`
   - Add labels if needed: `gh pr edit --add-label "bug"`

## Error Handling

### Common Issues

1. **No commits ahead of main**: The branch has no changes to submit
   - Ask if the user meant to work on a different branch

2. **Branch not pushed**: Remote doesn't have the branch
   - Push the branch first: `git push -u origin HEAD`

3. **PR already exists**: A PR for this branch already exists
   - Show the existing PR: `gh pr view`
   - Ask if they want to update it instead

4. **Merge conflicts**: Branch conflicts with base
   - Guide user through resolving conflicts or rebasing

## Summary Checklist

Before finalizing, ensure:
- [ ] `gh` CLI is installed and authenticated
- [ ] Working directory is clean
- [ ] All commits are pushed
- [ ] Branch is up-to-date with base branch
- [ ] Related issue number is identified, or placeholder is used
- [ ] PR description follows the template exactly
- [ ] Appropriate type of change is selected
- [ ] Pre-flight checklist items are addressed