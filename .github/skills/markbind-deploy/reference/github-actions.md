# Deploy via GitHub Actions

## Basic Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy MarkBind Site
on:
  push:
    branches: [master, main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm i -g markbind-cli
      - run: markbind deploy --ci
```

## Helper Action Option

```yaml
name: Deploy MarkBind Site
on:
  push:
    branches: [master, main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build & Deploy MarkBind site
        uses: MarkBind/markbind-action@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Cross-Repository Deploy (Important)

If `deploy.repo` in `site.json` points to a different repository, default `GITHUB_TOKEN` is not enough.

Use a PAT secret with write permission:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.PAT_TOKEN }}
run: markbind deploy --ci
```

You can also map to a custom variable and pass its name:

```yaml
env:
  MY_TOKEN: ${{ secrets.PAT_TOKEN }}
run: markbind deploy --ci MY_TOKEN
```

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
