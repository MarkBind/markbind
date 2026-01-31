# AGENTS.MD: Vue Components Package Guide

## Package Overview
The `@markbind/vue-components` package contains the Vue 3 component library utilized by MarkBind sites.

## Core Technologies
*   **Framework:** Vue 3
*   **Style:** Bootstrap / Scoped CSS

## Key Files
*   `src/*.vue`: Vue components.
*   `src/__tests__/`: Component tests.

## Development Workflow
*   **Testing:**
    *   `npm test`: Run component tests.
    *   `npm run updatetest`: Snapshot updates.
    *   Use `markbind serve -d` in a test site to visually verify components.

## Coding & Contribution Rules
### Do
- **Vue Options API**: Maintain consistency with existing components (e.g., `Box.vue`).
- **Scoped CSS**: Prevent style leakage.
- **Props**: Define clear props with types and defaults.

### Don't
- **Composition API**: Avoid unless explicitly approved.
- **Hardcoding**: Use props or bootstrap tokens for colors/styles.
