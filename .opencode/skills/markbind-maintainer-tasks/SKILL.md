---
name: markbind-maintainer-tasks
description: Maintainer-specific tasks for the MarkBind project including PR review, merging strategies, release procedures, and repository management. Use when reviewing pull requests, merging PRs, preparing releases, managing contributors, or performing other maintainer-only operations on the MarkBind repository.
---

# MarkBind Maintainer Tasks

## PR Review and Approval

### Approval Requirements

**Simple PRs** (typo fixes, minor documentation):
- 1 approval sufficient for merging

**Non-trivial PRs**:
- 2 approvals required
- Once 2nd approval from senior developer (or >= 3 approvals from anyone), can merge immediately
- If only 1 approval, wait 1 day before merging

**Rationale**: Give other developers chance to review.

### Review Checklist

- [ ] Code follows style guides
- [ ] Tests added/updated appropriately
- [ ] Test sites updated if needed
- [ ] Documentation updated if needed
- [ ] No security concerns
- [ ] Backwards compatibility considered
- [ ] Bundle size impact acceptable (if frontend change)
- [ ] SSR compatibility maintained (if Vue component)
- [ ] TypeScript migration follows two-commit strategy (if applicable)

### Code Coverage

Check Codecov report in CI pipeline:
- Significant degradation requires attention
- Understand cause of coverage change
- May cause false-positive CI failure on master if coverage drops

## Merging PRs

### Before Merging

**Critical**: Re-sync PR branch with master to trigger CI:
1. Ensure PR branch is up-to-date with master
2. Wait for CI to pass
3. Even if no conflicts, tests may fail when integrated with latest master

### Merge Strategies

**Default: Squash Merge**
- Use for most PRs
- Clean linear history
- Consolidates all commits into one

**Merge Commit**
- Use when commits are well-organized
- Single task tackled with dependent changes
- Example: Multi-step feature with logical commit progression

**Rebase Merge**
- Use when commits are independent tasks
- Rare - PRs should focus on related changes
- Example: [PR #1238](https://github.com/MarkBind/markbind/pull/1238)

**TypeScript Migrations: Rebase Merge**
- Required to preserve "Rename" + "Adapt" commits
- Critical for maintaining file history

### Merge Commit Format

```
PR_TITLE (#PR_NUMBER)

Optional body with:
- Implementation details
- Breaking changes
- Migration instructions
```

Example:
```
Add built-in support for light themes from bootswatch (#745)

Adds support for all Bootswatch light themes. Users can now specify
theme in site.json without manually including CSS files.
```

### Merge Commit Guidelines

**Title**:
- Follow [Git conventions](https://se-education.org/guides/conventions/git.html)
- Clear, descriptive, imperative mood
- Include PR number

**Body** (for non-trivial PRs):
- Explain "why" not just "what"
- Breaking changes with migration instructions
- Implementation decisions
- Related issues

### Critical: Check for Concurrent Merges

Before confirming merge:
1. Refresh GitHub page
2. Verify no other PRs merged since you started drafting
3. If another PR was merged, GitHub may merge without squashing (glitch)

Reference: [MarkBind#1160](https://github.com/MarkBind/markbind/pull/1160)

## Post-Merge Tasks

### 1. Add Version Label

Tag PR with impact:
- `r.Major` - Breaking changes
- `r.Minor` - New features
- `r.Patch` - Bug fixes, minor improvements

**Why**: Helps release manager determine next version.

### 2. Draft Release Notes (if Breaking Changes)

Work with PR author to add release note in PR description:

```markdown
### Breaking Changes

**Old behavior**: Description of what changed
**New behavior**: What it does now
**Migration**: Steps to update existing sites

Example:
Old: `<include src="file.md">`
New: `<include src="file.md" inline>`
Migration: Add `inline` attribute to all includes that should be inline.
```

### 3. Undo Accidental Merge

If wrong merge strategy used:

```bash
# 1. Switch to master locally
git checkout master

# 2. Reset to before merge
git reset --hard HEAD~1

# 3. Force push (requires write access)
git push --force

# 4. Create new PR from original branch
# 5. Merge with correct strategy
```

**Warning**: Force pushing rewrites history. Use with caution. Check no ongoing work conflicts with this.

## Release Process

For complete release procedures, see [references/release-procedures.md](references/release-procedures.md).

### Quick Overview

1. **Verify permissions** (GitHub releases, npm publish)
2. **Clean state**: `npx lerna clean && npm run setup`
3. **Increment version**: `npx lerna version --no-push --exact`
4. **Build frontend**: `npm run build:web`
5. **Update tests**: `npm run updatetest`
6. **Combine commits**: Amend version commit with bundle/test changes
7. **Push**: `git push upstream master && git push upstream vX.Y.Z`
8. **Publish**: `npx lerna publish from-git`
9. **Smoke test**: Install and test new version
10. **GitHub release**: Draft release notes
11. **Announce**: Post to Slack

## Managing Contributors

### All-Contributors System

Uses [all-contributors](https://allcontributors.org/) specification.

### Adding Contributors

Use all-contributors bot in PR comments:

```
@all-contributors please add @username for code
```

**Contribution Types**:
- `code` - Code contributions
- `doc` - Documentation
- `test` - Tests
- `bug` - Bug reports
- `question` - Answering questions
- `mentoring` - Mentoring others

**Multiple Types**:
```
@all-contributors please add @username for code, doc
```

**Updating Later**:
```
@all-contributors please add @username for test
```
Result: Icons accumulate (code + test).

### Workflow

1. PR is merged
2. Comment with `@all-contributors` command
3. Bot creates automatic PR
4. Review and merge bot's PR
5. Delete bot's branch

## Repository Management

### GitHub Projects

Use [GitHub Projects](https://github.com/MarkBind/markbind/projects) for:
- Version planning
- Feature roadmaps
- Issue triage
- Progress tracking

### Creating Projects

1. Identify goals (e.g., "Better Logging", "User Demand")
2. Create project with clear description
3. Add relevant issues
4. Track progress with project views

### Project Tips

- Don't treat as strict guide - tool for prioritization
- Help teams communicate and collaborate
- Triage issues into categories
- Use multiple views (Kanban, table, calendar)
- Custom fields for categorization

### Managing Teams

MarkBind has structured GitHub teams:

**Maintainers** (Maintain Access):
- `maintainers` - Parent team
- `team-leads` - Mentors and leads
- `release-manager-admins` - Release managers

**Developers** (Write Access):
- `developers` - Parent team
- `junior-developers` - Building familiarity
- `senior-developers` - Experienced developers

**Contributors** (Triage Access):
- `active-contributors` - Regular contributors

### Team Maintenance

Review and update rosters regularly (e.g., start/mid/end of semester):

1. **Review Activity**: Identify inactive members or those who progressed
2. **Promote Members**: Move eligible members up hierarchy
3. **Audit Membership**: No "floating" members in parent teams without child team

### Contributor Journey

```
New Contributor
  ↓ (consistent contribution)
active-contributors
  ↓
junior-developers
  ↓ (demonstrated expertise)
senior-developers
  ↓ (leadership/release management)
team-leads / release-manager-admins
```

## Issue Management

### Labeling Issues

**Type Labels**:
- `d.Feature` - New feature requests
- `d.Enhancement` - Improvements to existing features
- `d.Bug` - Bug reports
- `d.Documentation` - Documentation issues

**Priority Labels**:
- `p.Critical` - Broken functionality, security issues
- `p.High` - Important but not critical
- `p.Medium` - Nice to have
- `p.Low` - Low priority

**Difficulty Labels**:
- `good first issue` - Good for newcomers
- `d.Moderate` - Requires some experience
- `d.Difficult` - Complex, requires deep knowledge

**Other Labels**:
- `s.Blocked` - Blocked by external factors
- `s.Duplicate` - Duplicate of another issue
- `s.Investigating` - Under investigation

### Triaging New Issues

1. **Verify issue**: Can you reproduce? Is description clear?
2. **Label appropriately**: Type, priority, difficulty
3. **Link related issues**: Reference related work
4. **Add to project** (if relevant): Include in roadmap
5. **Request information**: If issue unclear, ask for details
6. **Close if invalid**: Duplicates, not issues, out of scope

### Closing Issues

Issues can be closed when:
- Fixed and merged
- Duplicate of another issue
- Not a bug / working as intended
- Out of scope for MarkBind
- Stale with no response

**Template responses** for common closures available in `.github/` (if created).

## Security

### Reporting Security Issues

Direct to private channels (email to maintainers or security policy).

### Handling Security Issues

1. **Assess severity**: Critical vs low impact
2. **Create private fix**: Don't disclose publicly yet
3. **Coordinate disclosure**: With reporter and team
4. **Release patch**: Priority release if critical
5. **Public disclosure**: After patch available

## Deployment

### User Guide Deployment

Automated via CI, but manual trigger if needed:

```bash
npm run deploy:ug
```

### Developer Guide Deployment

```bash
npm run deploy:dg
```

### Netlify Deployment

Pull requests get preview deploys automatically. Check Netlify bot comment for preview URL.

## Best Practices

### Communication

- Be respectful and welcoming
- Provide constructive feedback
- Explain decisions clearly
- Thank contributors for their work

### Code Quality

- Don't compromise quality for speed
- Request changes if necessary
- Provide guidance for improvements
- Pair complex changes with good tests

### Maintenance

- Keep dependencies updated
- Address security vulnerabilities promptly
- Monitor for issues after releases
- Be responsive to community

### Documentation

- Update docs with code changes
- Keep release notes accurate
- Document decisions in PRs/issues
- Maintain clear project guidelines

## Resources

- [SE-EDU PR Guidelines](https://se-education.org/guides/guidelines/PRs.html)
- [MarkBind Contributor Guidelines](https://github.com/MarkBind/markbind/blob/master/CONTRIBUTING.md)
- [Semantic Versioning](https://semver.org/)
- [All Contributors](https://allcontributors.org/)
