# Deployment Troubleshooting

## Links Broken After Deploy

- Verify `baseUrl` in `site.json` matches deployed path.
- For GitHub Pages project sites, use `"/<repositoryName>"`.

## Site Not Updated After "Successful" Deploy

- Check GitHub Pages is configured to publish from the deploy branch (commonly `gh-pages`).
- For cross-repository GitHub Actions deploy, use PAT instead of default `GITHUB_TOKEN`.

## Favicon Not Updating

- Hard refresh browser cache.
- Verify `faviconPath` in `site.json` points to the expected file.

## Intra-Link Warnings for CI-only Paths

Use no-validation syntax for links generated only in CI contexts:

```markdown
[CI built page](/coverage/index.html{no-validation})
```

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
