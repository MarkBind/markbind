**What is the purpose of this pull request?**

- [x] Documentation update
- [ ] Bug fix
- [x] Feature addition or enhancement
- [ ] Code maintenance
- [ ] DevOps
- [x] Improve developer experience
- [ ] Others, please explain:

<!--
  If this pull request is addressing an issue, link to the issue: #xxx

  If this pull request completely addresses an issue, use one of the closing keywords: "Fixes #xxx" or "Resolves #xxx"
  https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword

  Otherwise, elaborate further on the rationale of this pull request as needed
-->

**Overview of changes:**

Add a new GitHub skill for creating pull requests that follows MarkBind project conventions and supports fork-to-upstream workflows.

**Anything you'd like to highlight/discuss:**

This skill was adapted from Cline's original create-pull-request skill with modifications to support fork-to-upstream workflows and automated upstream remote detection. The skill provides comprehensive guidance for PR creation including prerequisite checks, context gathering, git best practices, and template-based PR generation.

**Testing instructions:**

Test the skill by running it on a feature branch with changes. Verify that it correctly:
- Detects gh CLI installation and authentication
- Identifies upstream remotes and base branches
- Analyzes commits and diffs
- Generates PR descriptions following the MarkBind template
- Handles common error scenarios

**Proposed commit message: (wrap lines at 72 characters)**

<!--
  See this link for more info on how to write a good commit message:
  https://se-education.org/guides/conventions/git.html

  As best as possible, write a succinct commit title in 50 characters

  |---------This is the width of 50 chars----------|
  |-----------This is the width of 72 chars for your reference-----------|
-->

Add create-pull-request GitHub skill

Add a comprehensive GitHub skill for creating pull requests that follows
MarkBind project conventions. The skill supports fork-to-upstream workflows,
automated upstream remote detection, and template-based PR generation.
Adapted from Cline's original skill with MarkBind-specific modifications.

---

**Checklist:** :ballot_box_with_check:

<!-- Leave non-applicable items unchecked -->

- [x] Updated the documentation for feature additions and enhancements
- [ ] Added tests for bug fixes or features
- [ ] Linked all related issues
- [x] No unrelated changes <!-- It's tempting, but increases the reviewer's work, and really pollutes the commit history =( -->

<!--
  We'll try our best to get to your PR within a week.
  If we haven't gotten to it then, or if your pull request resolves an urgent item, feel free to give us a ping!
-->

---

**Reviewer checklist:**

Indicate the [SEMVER](https://semver.org/) impact of the PR:
- [ ] Major (when you make incompatible API changes)
- [ ] Minor (when you add functionality in a backward compatible manner)
- [ ] Patch (when you make backward compatible bug fixes)

At the end of the review, please label the PR with the appropriate label: `r.Major`, `r.Minor`, `r.Patch`.

Breaking change release note preparation (if applicable):
- To be included in the release note for any feature that is made obsolete/breaking

> Give a brief explanation note about:
>   - what was the old feature that was made obsolete
>   - any replacement feature (if any), and
>   - how the author should modify his website to migrate from the old feature to the replacement feature (if possible).