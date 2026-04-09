# Ignore Files for Deployment

## `.gitignore`

Typical entries for MarkBind sites:

```gitignore
_site/
node_modules/
```

MarkBind-generated `.gitignore` may also include logs, env files, and IDE settings.

## `site.json` `ignore`

Use `ignore` to prevent files from being copied to output:

```json
{
  "ignore": [
    "_site/*",
    "*.json",
    "*.md",
    ".git/*",
    ".gitignore",
    "node_modules/*"
  ]
}
```

## User Guide Source

- <https://markbind.org/userGuide/gitignoreFile.html>
- <https://markbind.org/userGuide/deployingTheSite.html>
