# PR Previews via Surge

## Setup Steps

1. Install Surge globally: `npm install --global surge`
2. Create/login account: `surge`
3. Generate token: `surge token`
4. Save token as repository secret: `SURGE_TOKEN`

## Required Workflows

Add two workflow files under `.github/workflows/`:

- `receivePR.yml` to build site artifacts on PR events
- `previewPR.yml` to deploy artifacts to Surge on workflow completion

## PR URL Pattern

In `previewPR.yml`, set a predictable domain such as:

```text
https://pr-<PR_NUMBER>-<YOUR_BASE_URL>.surge.sh/
```

Replace `<YOUR_BASE_URL>` with a unique project identifier.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
