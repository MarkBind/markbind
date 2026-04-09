# Serve Workflow

## Core Behavior

`markbind serve` does all of the following:

1. Builds the site (default output: `_site/`)
2. Starts a local server (default `127.0.0.1:8080`)
3. Opens a live preview

```bash
markbind serve
```

## Useful Serve Options

```bash
markbind serve -o guide/index.md
markbind serve -b
markbind serve -n
markbind serve -p 3000
markbind serve -a ::1
markbind serve -f
markbind serve -s site-dev.json
markbind serve -v
```

- `-o, --one-page <file>` start in single-page mode
- `-b, --background-build` background builds remaining pages while serving one page
- `-n, --no-open` do not auto-open browser
- `-p, --port <port>` custom port
- `-a, --address <address>` custom host / bind address
- `-f, --force-reload` force live reload of all files
- `-s, --site-config <file>` choose non-default site config
- `-v, --verbose` verbose logs for troubleshooting

## Caveat with One-Page Mode

When using `--one-page`, pages not yet built can have missing or stale search results until they are built (by navigation or background build).

## User Guide Source

- <https://markbind.org/userGuide/cliCommands.html>
