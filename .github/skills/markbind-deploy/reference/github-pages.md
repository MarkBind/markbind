# Deploy to GitHub Pages

## Core Command

```bash
markbind deploy
markbind deploy --no-build
```

- `markbind deploy` builds and deploys to the configured branch (default: `gh-pages`).
- Use `--no-build` only if you already built with custom `markbind build` options.

## `site.json` Deploy Config

```json
{
  "deploy": {
    "message": "Site Update.",
    "repo": "https://github.com/org/repo.git",
    "branch": "gh-pages"
  }
}
```

## `baseUrl` Requirement

For GitHub Pages project sites, set `baseUrl` to `"/<repositoryName>"`.

```json
{
  "baseUrl": "/myproduct"
}
```

Example: repo `myorg/myproduct` -> `"/myproduct"`.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
