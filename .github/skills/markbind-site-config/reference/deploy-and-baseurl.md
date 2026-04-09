# Deploy and baseUrl Config

## Deploy Block

```json
{
  "deploy": {
    "message": "Site Update.",
    "repo": "https://github.com/org/repo.git",
    "branch": "gh-pages"
  }
}
```

## baseUrl

Set `baseUrl` to match deployed path.

For GitHub Pages project site `https://org.github.io/repo`, use:

```json
{
  "baseUrl": "/repo"
}
```

## User Guide Sources

- <https://markbind.org/userGuide/siteJsonFile.html#baseurl>
- <https://markbind.org/userGuide/deployingTheSite.html>
