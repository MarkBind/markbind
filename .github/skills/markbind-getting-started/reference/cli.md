# CLI Commands

## Command Groups

- **Setup:** `markbind init`
- **Site lifecycle:** `markbind serve`, `markbind build`, `markbind deploy`
- **Help:** `markbind --help`, `markbind <command> --help`

If MarkBind is not globally installed, prefix commands with `npx markbind-cli`.

## `init`

```bash
markbind init [root]
markbind init --template minimal
markbind init --convert
```

- Creates a MarkBind site skeleton (`index.md`, `site.json`, `_markbind/` assets).
- `--convert` converts existing GitHub wiki / docs folders.

## `serve`

```bash
markbind serve
markbind serve -o guide/index.md
markbind serve -b
markbind serve -p 3000
```

- Builds and serves locally (default `http://127.0.0.1:8080`).
- `-o/--one-page` starts in single-page mode.
- `-b/--background-build` improves one-page workflow by building remaining pages in background.

## `build`

```bash
markbind build
markbind build ./src ./out
markbind build --baseUrl staging
```

- Generates output into `_site/` by default.
- Accepts custom root/output directories and site config overrides.

## `deploy`

```bash
markbind deploy
markbind deploy --no-build
markbind deploy --ci
```

- Builds (unless `--no-build`) and publishes to GitHub Pages branch configured for the site.
- `--ci` supports CI workflows with token-based auth.

## Common Shared Options

- `-s, --site-config <file>` use a non-default site config file
- `-v, --verbose` enable verbose diagnostics

## User Guide Source

- <https://markbind.org/userGuide/cliCommands.html>
