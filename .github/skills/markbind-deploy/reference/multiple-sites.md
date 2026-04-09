# Deploying Multiple MarkBind Sites

Use separate site config files (for example `site-user.json` and `site-dev.json`) and deploy each one independently.

## Example

```bash
markbind build -s site-user.json
markbind build -s site-dev.json
markbind deploy -s site-user.json
markbind deploy -s site-dev.json
```

Ensure each site config has the correct `baseUrl` for its final host path.

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
