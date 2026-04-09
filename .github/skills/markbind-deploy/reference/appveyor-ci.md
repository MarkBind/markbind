# Deploy via AppVeyor CI

## Workflow File

Create `appveyor.yml` in repo root:

```yaml
environment:
  nodejs_version: '22'

branches:
  only:
    - master

install:
  - ps: Install-Product node $env:nodejs_version
  - npm i -g markbind-cli
  - markbind deploy --ci

test: off
build: off
```

## Required Secret

Set encrypted `GITHUB_TOKEN` in AppVeyor project environment settings.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
