# MarkBind Agent Skills

This directory contains Agent Skills for AI agents working on the MarkBind project. These skills provide domain-specific expertise about MarkBind's architecture, development workflows, and best practices.

## Available Skills

### 1. markbind-dev-workflow
**Purpose**: Day-to-day development workflows and testing procedures

**Use when**:
- Setting up MarkBind for development
- Making backend (TypeScript/JavaScript) changes
- Making frontend (Vue components) changes  
- Running tests and updating test sites
- Preparing pull requests

**Key topics**:
- Environment setup and prerequisites
- Backend compilation (TypeScript → JavaScript)
- Frontend development with `-d` flag
- Testing workflow (linting, unit, functional tests)
- Git workflow and keeping fork updated
- Debugging configurations

**Reference files**:
- `references/test-patterns.md` - Detailed test site procedures
- `references/git-hooks.md` - Pre-commit hook details

---

### 2. markbind-architecture
**Purpose**: Understanding MarkBind's internal architecture and code organization

**Use when**:
- Understanding how MarkBind works internally
- Navigating the codebase
- Implementing features that interact with core processing
- Understanding package relationships

**Key topics**:
- Monorepo structure (4 packages)
- Content processing flow (Nunjucks → Markdown → HTML)
- Key classes (Site, Page, Layout, External, NodeProcessor)
- Package responsibilities and relationships

**Reference files**:
- `references/core-package.md` - Deep dive into core package
- `references/vue-integration.md` - Vue and SSR details
- `references/external-libraries.md` - Key dependencies and patches

---

### 3. markbind-component-patterns
**Purpose**: Implementation patterns for components and features

**Use when**:
- Adding new MarkBind components
- Modifying existing components
- Implementing features
- Ensuring SSR compatibility

**Key topics**:
- Component implementation approaches (node transformation, Vue, plugin)
- Vue component guidelines (props, slots, registration)
- SSR compatibility requirements
- Dependency management strategies

**Reference files**:
- `references/ssr-patterns.md` - SSR rules and hydration issues
- `references/dependency-management.md` - Adding/updating dependencies

---

### 4. markbind-typescript-migration
**Purpose**: Complete guide for migrating JavaScript to TypeScript in MarkBind

**Use when**:
- Migrating .js files to .ts in MarkBind's core package
- Preparing TypeScript migration pull requests
- Understanding the Rename+Adapt commit workflow
- Converting import/export syntax from CommonJS to TypeScript

**Key topics**:
- Two-commit strategy (Rename + Adapt)
- Preserving git history (similarity index)
- Import/export syntax conversion
- TypeScript error fixing patterns
- Testing migrated code

**Reference files**:
- `references/preparation.md` - Planning migration scope, installing types
- `references/rename-commit.md` - Creating the "Rename" commit
- `references/adapt-commit.md` - Creating the "Adapt" commit
- `references/import-export-syntax.md` - CommonJS ↔ TypeScript/ES6 conversion
- `references/troubleshooting.md` - Common issues and solutions

---

### 5. markbind-maintainer-tasks
**Purpose**: Maintainer-specific tasks and procedures

**Use when**:
- Reviewing pull requests
- Merging PRs with appropriate strategy
- Preparing releases
- Managing contributors
- Performing repository management tasks

**Key topics**:
- PR review and approval requirements
- Merge strategies (squash, merge commit, rebase)
- Post-merge tasks (version labels, release notes)
- Release procedures
- Contributor management (all-contributors)
- Repository management (projects, teams)

**Reference files**:
- `references/release-procedures.md` - Complete release guide

---

## Skill Architecture

Each skill follows the Agent Skills best practices:

### Level 1: Metadata (always loaded)
- YAML frontmatter with `name` and `description`
- ~100 tokens per skill
- Used by Claude to determine when to load the skill

### Level 2: Instructions (loaded when triggered)
- SKILL.md body with core guidance
- Kept under 500 lines for context efficiency
- References to level 3 resources for details

### Level 3: Resources (loaded as needed)
- Detailed reference files in `references/` subdirectory
- Loaded only when Claude determines they're needed
- No practical size limit due to on-demand loading

## Design Principles

### Concise Focus
Each skill body stays under 500 lines, with detailed information in reference files.

### Progressive Disclosure
Information is split into files that load on-demand:
- Quick start info in SKILL.md
- Detailed procedures in reference files
- No duplication between files

### Clear Triggers
Each description includes:
- What the skill does
- Specific contexts for when to use it
- Keywords that should trigger the skill

### No Duplication
Information lives in one place only - either in SKILL.md or a reference file, never both.

## Usage Notes

### For AI Agents

These skills are automatically discovered and loaded when relevant to your task. You don't need to explicitly invoke them.

When a skill triggers:
1. The SKILL.md body loads into context
2. Reference files are loaded as needed
3. Use bash commands to read files when referenced

### For Developers

To add or update skills:
1. Edit the relevant SKILL.md or reference files
2. Keep SKILL.md bodies concise (<500 lines)
3. Move detailed content to reference files
4. Update descriptions if trigger conditions change
5. Test by asking Claude questions that should trigger the skill

## Skill Coverage

**Development lifecycle covered**:
- ✅ Initial setup and environment configuration
- ✅ Daily development (backend and frontend)
- ✅ Testing and test site management
- ✅ Component and feature implementation
- ✅ TypeScript migration procedures
- ✅ SSR compatibility and hydration
- ✅ PR submission and review
- ✅ Release management
- ✅ Repository administration

**Not covered** (intentionally):
- General git/npm knowledge (Claude already knows)
- Project management for non-maintainers
- User-facing documentation (in main docs)

## File Structure

```
.claude/skills/
├── README.md
├── markbind-dev-workflow/
│   ├── SKILL.md
│   └── references/
│       ├── test-patterns.md
│       └── git-hooks.md
├── markbind-architecture/
│   ├── SKILL.md
│   └── references/
│       ├── core-package.md
│       ├── vue-integration.md
│       └── external-libraries.md
├── markbind-component-patterns/
│   ├── SKILL.md
│   └── references/
│       ├── ssr-patterns.md
│       └── dependency-management.md
├── markbind-typescript-migration/
│   ├── SKILL.md
│   └── references/
│       ├── preparation.md
│       ├── rename-commit.md
│       ├── adapt-commit.md
│       ├── import-export-syntax.md
│       └── troubleshooting.md
└── markbind-maintainer-tasks/
    ├── SKILL.md
    └── references/
        └── release-procedures.md
```

## Maintenance

### Updating Skills

When MarkBind's processes or architecture change:

1. Identify which skill(s) need updating
2. Update the relevant SKILL.md or reference file
3. Keep descriptions current with trigger conditions
4. Test that Claude loads and uses the updated skill correctly

### Adding New Skills

Consider adding a new skill when:

1. A distinct domain of knowledge emerges
2. Existing skills become too large (>500 lines in SKILL.md)
3. A new workflow or process is established
4. The new content doesn't fit existing skill boundaries

Follow the Agent Skills best practices for structure and format.

## Questions or Issues

If you encounter issues with these skills or have suggestions:

1. File an issue in the MarkBind repository
2. Tag with appropriate labels
3. Provide context about what you were trying to do
4. Include any error messages or unexpected behavior

---

*Last updated: January 2026*
*Skills version: 1.0.0*
