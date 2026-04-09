# Deploy via Travis CI

## Workflow File

Create `.travis.yml` in repo root:

```yaml
language: node_js
node_js:
  - 22
install:
  - npm i -g markbind-cli
script: markbind build
deploy:
  provider: script
  script: markbind deploy --ci
  skip_cleanup: true
  on:
    branch: master
```

## Required Secret

Set `GITHUB_TOKEN` in Travis repository environment variables.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
