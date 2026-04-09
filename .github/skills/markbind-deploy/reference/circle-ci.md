# Deploy via Circle CI

## Workflow File

Create `.circleci/config.yml`:

```yaml
jobs:
  Build-And-Deploy:
    docker:
      - image: 'cimg/base:stable'
    steps:
      - checkout
      - node/install:
          node-version: "22"
      - run: npm i -g markbind-cli
      - run: markbind deploy --ci
version: 2.1
orbs:
  node: circleci/node@4.1.0
workflows:
  Deploy-MarkBind-Site:
    jobs:
      - Build-And-Deploy
```

## Required Secret

Set `GITHUB_TOKEN` in Circle CI project environment variables.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
