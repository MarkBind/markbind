# AGENTS.MD: Core Web Package Guide

## Package Overview
The `@markbind/core-web` package manages client-side assets (JS/CSS) and the webpack build process.

## Core Technologies
*   **Language:** JavaScript, Vue
*   **Build Tool:** Webpack (with `babel`, `vue-loader`).

## Key Files
*   `webpack.build.js`: Webpack configuration.
*   `src/`: Client-side JavaScript/Vue entry points.

## Development Workflow
*   **Editing Frontend Features:**
    *   **Recommended**: Run `markbind serve -d` to compile bundles and enable hot reloading.
    *   **Release Only**: `npm run build:client` / `npm run build:server`.
    *   **Do NOT** build full bundles manually during development.

## Coding & Contribution Rules
### Do
- Use Webpack for bundling assets.
- Ensure `babel` transforms are correctly configured for target browsers.
