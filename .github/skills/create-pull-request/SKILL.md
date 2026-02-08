---
name: create-pull-request
description: Create a GitHub pull request following project conventions. Use when the user asks to create a PR, submit changes for review, or open a pull request. Handles commit analysis, branch management, and PR creation using the gh CLI tool. Please specify if you would like a Draft PR (for early feedback), or a Dry Run (to preview the PR locally).
compatibility: opencode
credit: |
  This skill was adapted from the original `create-pull-request` skill developed by the **[Cline](https://github.com/cline/cline)** team. 
  - **Original Source**: [cline/cline/.cline/skills/create-pull-request](https://github.com/cline/cline/blob/main/.cline/skills/create-pull-request/SKILL.md)
modification: Modified to support **Fork-to-Upstream** workflows and automated upstream remote detection.
---

# Create Pull Request (Fork-to-Upstream Version)

This skill guides you through creating a well-structured GitHub pull request that follows project conventions and best practices.
**Important**: Follow each step closely. Do not default to a more direct approach. For each section, you **must** follow these each step number incrementally (**DO NOT SKIP ANY STEPS**).

## Step 1. Mode Validation (Mandatory Start)

**Strict Requirement**: You must determine the PR mode from the user's initial request before executing any other commands.

## Step 1.1. **Check Mode**: Run `bash helpers/validate_mode.sh "{{user_message}}"`.
   
## Step 1.2. **Evaluate**:
   - **If `MODE: UNDEFINED`**:
     - **TERMINATE IMMEDIATELY**. Do not check prerequisites. Do not gather context. Do not proceed with the skill.
     - **Response to User**: 
       > "To create a pull request, I need to know the intended mode. Please specify if you would like a **Draft PR** (for early feedback), or a **Dry Run** (to preview the PR locally)."
   - **If `MODE: DRAFT` or `DRY_RUN`**:
     - Record the mode and proceed to **## Step 2. Prerequisites Check**.

## Step 2. Prerequisites Check

**Strict Requirement**: You must verify the environment before any other actions. Do not proceed if any check fails.

### Step 2.1. **Execute Checks**: Run `bash helpers/check_prereqs.sh`.
   
### Step 2.2. **Handle Results**:
   - **If `gh_not_installed`**: Output the installation instructions found in `RESOURCES.md` and stop.
   - **If `gh_not_authenticated`**: Instruct the user to run `gh auth login` as detailed in `RESOURCES.md` and stop.
   - **If `dirty_working_dir`**: 
     - **STOP** and display the current `git status`.
     - Explicitly ask the user: "Would you like to commit these changes, stash them, or discard them?" as detailed in `RESOURCES.md`
     - **Important**: Do not stage any uncommitted changes without explicit confirmation.
   - **If `all_systems_go`**: Proceed to "Gather Context."

## Step 3. Gather Context

**Strict Requirement**: You must analyze the delta between your local branch and `origin` while ensuring an `upstream` target is configured. 

**Strict Requirement**: You **must** follow these 4 steps incrementally (**DO NOT SKIP ANY STEPS**)

### Step 3.1. **Execute Discovery**: Run `bash helpers/gather_context.sh`.

### Step 3.2. **Upstream Verification**:
   - Check the `UPSTREAM_STATUS`.
   - **If `MISSING`**: 
     - **STOP**. Inform the user that the `upstream` remote is required for the Fork-to-Upstream workflow.
     - Provide the command: `git remote add upstream <url_of_original_repo>`.
   - **If `EXISTS`**: Proceed.

### Step 3.3. **Branch & Commit Validation**:
   - Ensure `CURRENT_BRANCH` is not `main` or `master`.
   - Review the commits in the `AHEAD_BY` count to understand scope and intent.

### Step 3.4. **Deep Diff Analysis (Three-Step Process)**:

   **Step A: Structural Mapping**
   - Use the `DIFF_SUMMARY` to identify all affected directories. 
   - Identify the **Primary Impact Zone** (where the most significant logic resides).

   **Step B: Detailed Investigation**
   - For every file in the Primary Impact Zone, run `git diff origin/master..HEAD -- [file_path]`.
   - **Requirement**: Do not just skim. Read the logic to understand *how* the implementation achieves the intent found in the commits.
   - Cross-reference with `ANALYSIS_GUIDE.md` to identify missing linkages (e.g., "Logic changed, but no tests found in `DIFF_SUMMARY`").

   **Step C: Synthesis**
   - Mentally map how these files interact. 
   - *Example: "The logic change in `packages/core` necessitates the configuration update seen in `opencode.json`."*

## Step 4. Information Gathering

### Step 4.1. **Validate & Infer**:
   - **Type of Change (Nature & Purpose Analysis)**: Do not rely solely on keywords. Use your **Deep Diff Analysis** to classify the changes based on its architectural impact.
   - **Description**: Do not provide a generic summary. Construct a "Technical Summary" that covers:
      - **The "What"**: Document the specific mechanical changes.
      - **The "Why"**: Based on the code context, infer the technical necessity. Why was this specific approach taken over another?
      - **The "Context"**: Describe how this change flows through the system.
      - **The "Conclusion"**: State the expected final state of the system once this PR is merged.
   - **Test Procedure**: Review the `DIFF_SUMMARY`. If no new tests were added, you **must** ask: *"How should this change be manually tested, and what are the potential breaking points?"*.

### Step 4.2. **User Confirmation**:
   - Present your gathered "PR Profile" to the user:
     - **Type**: [Type]
     - **Description**: [Summary]
     - **Tests**: [Procedure]
   - Ask: *"Does this profile look correct, or should I adjust anything before I check Git Best Practices?"*

## Step 5. Git Best Practices

**Strict Requirement**: You must audit the branch history and ensure it is "PR-ready" according to project standards.

### Step 5.1. **Run Hygiene Audit**: Execute `bash helpers/check_git_hygiene.sh`.

### Step 5.2. **Address Commit Hygiene**:
   - **Atomic Commits**: If `LARGE_COMMITS` are detected, ask: *"I noticed commit [hash] touches many files. Should we squash or split these to maintain atomic commit history?"*
   - **Conventional Commits**: Verify if existing messages follow the [SE-Education standards](https://se-education.org/guides/conventions/git.html). If not, suggest: `git commit --amend` for the most recent one.
   - **Merge Commits**: If `MERGE_COMMITS_FOUND` is not "None", inform the user: *"I detected merge commits. Project policy prefers a clean history via rebasing."*

### Step 5.3. **Branch Management (Rebase Flow)**:
   - Check `BEHIND_UPSTREAM_MAIN`.
   - **If > 0**: You **must** recommend a rebase to ensure no conflicts occur after PR creation:
     ```bash
     git fetch upstream
     git rebase upstream/main
     ```
   - **Warning**: If a rebase occurs, explicitly notify the user that the next push will require `--force-with-lease`.

### Step 5.4. **Final Synchronization**:
   - Ensure all local work is reflected on the remote fork:
     ```bash
     git push origin HEAD
     ```
   - If a rebase was performed: `git push origin HEAD --force-with-lease`.
   - **Verification**: Confirm the push was successful before moving to "Create the Pull Request."

## Step 6. Create the Pull Request

**Strict Requirement**: You must use the project's PR template and follow the Fork-to-Upstream execution flow.

### Step 6.1. Template Preparation
   - **Check Template**: Run `bash helpers/prepare_pr_bundle.sh`. 
   - **If `TEMPLATE_MISSING`**: Notify the user and ask: *"The .github/PULL_REQUEST_TEMPLATE is missing. Should I proceed with a standard format?"*
   - **Formatting**: Populate the template. Your PR body **must** strictly match the template's Markdown structure.

### Step 6.2. Content Generation Logic (based on the Template fill in each section accordingly)
   - **What is the purpose of this pull request?**: Apply rules from **Purpose Checklist Rules** in `PR_STANDARDS.md`.
   - **Overview of changes**: Write 1-2 sentences. **Mandatory**: Append "This PR was generated using the `create-pull-request` skill."
   - **Anything you'd like to highlight/discuss**: Explain the *how* and *why* of specific technical choices. **Important**: This section should go in depth based on the **Deep Diff Analysis** & **Information Gathering** findings. You **must** avoid buzzwords at all costs to keep the writing natural.
   - **Testing instructions**: Detail manual steps (e.g., `markbind serve`). If none, leave the section blank.
   - **Proposed commit message: (wrap lines at 72 characters)**: Title < 50 chars, Body wrapped at 72. Follow [SE-Education standards](https://se-education.org/guides/conventions/git.html) referenced in the template.
   - **Checklist**: Apply rules from **Final Checklist Section** in `PR_STANDARDS.md`.
   - **Reviewer checklist**: Leave the **Reviewer checklist** and **SEMVER** sections **unchecked** and unmodified. These are for the maintainers to fill out during review.

### Step 6.3. Final Execution Choice
- **STOP**: You must ask the user which type of PR to create before running the command:
  1. **Draft PR**: For early feedback.
  2. **Dry Run**: Preview the PR locally.

### Step 6.4. CLI Execution
Execute the command based on the choice:

- **Draft PR**:
   ```bash
   gh pr create --repo upstream_owner/repo_name --base main --head your_username:your_branch --title "PR_TITLE" --body "PR_BODY" --draft
   ```

- **Dry Run**:
   ```bash
   gh pr create --repo upstream_owner/repo_name --base main --head your_username:your_branch --title "PR_TITLE" --body "PR_BODY" --dry-run
   ```

## Step 7. Post-Creation

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
- [ ] Branch is up-to-date with base branch
- [ ] Related issue number is identified, or placeholder is used
- [ ] PR description follows the template exactly
- [ ] Appropriate type of change is selected
- [ ] Pre-flight checklist items are addressed