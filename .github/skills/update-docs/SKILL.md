---
name: update-docs
description: >
  Update user or developer documentation only if the change is relevant to the specific purpose of the documentation.
  Use when editing files within the `docs/` folder.
---

# Updating Documentation

You are a pragmatic senior developer who is particular about maintaining concise but useful & relevant documentation.
Follow this workflow to ensure documentation updates are relevant and purposeful.

## 1. Determine Documentation Purpose
Identify the **goal** of the documentation you are updating:
- **User Documentation**: Focuses on how to use the project (features, APIs, workflows, examples).
- **Developer Documentation**: Focuses on how to contribute to the project (architecture, internals, build processes, dependencies).

## 2. Assess Change Relevance
For each change, evaluate its relevance based on the documentation type:

| Change Type               | User Documentation                     | Developer Documentation    |
|---------------------------|----------------------------------------|----------------------------|
| New feature               | ✅ Update (usage, examples)            | ✅ Update (implementation)  |
| Breaking change           | ✅ Update (migration notes)            | ✅ Update (code changes)    |
| Bug fix                   | ✅ Update if user-facing               | ✅ Update if relevant       |
| Dependency bump           | ❌ Skip                                | ❌ Skip                     |
| Internal refactor         | ❌ Skip                                | ✅ Only if affects workflow |

## 3. Review Changes
Use ONLY the following to obtain the changelog:
```bash
bash /mnt/skills/user/update-docs/scripts/get-diff.sh [arg1]
```
Arguments:
- `arg1` - Optional argument that should be used when a specific SHA is specifically supplied.

Output:
The git diff and relevant changes to review.

## 4. Key Questions for LLM pre-review
Before updating, ask:
- *"Does this change directly impact the audience (users or developers) of the documentation I’m editing? If not, skip it."*
- *"Am I unsure of any part of the update I'm making? If so, I must clarify before proceeding."*

## 4. Update Documentation
- **User Documentation**: Focus on what users need to know (e.g., new features, deprecated functionality).
- **Developer Documentation**: Focus on what developers need to know (e.g., new build steps, architecture changes).

When updating documentation, keep in mind the rules specified in [RULES.md](docs/RULES.md)

## 5. Diagrams and Visuals
- Add/update **Mermaid diagrams** if the change affects workflows, architecture, or user/developer processes.
- For static diagrams (e.g., `.png`), flag for manual review if the change alters the visualized concept.

## 6. Rules for Packages/Dependencies
- **User Documentation**: Only mention packages if they are part of the public interface (e.g., "This project requires Docker 20.10+").
- **Developer Documentation**: List packages only if they are critical to the build/development process (e.g., "Use Node.js 18+").

## 7. Automation Tips
- Pre-filter changes using scripts (e.g., ignore `package.json` updates unless they include `BREAKING CHANGE` or `feat`).
- Flag ambiguous cases for manual review (e.g., "This change might affect the 'Configuration' section—please verify").
