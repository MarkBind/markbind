# Plugins Configuration

## Enable Plugins

```json
{
  "plugins": ["filterTags", "codeBlockCopyButtons"],
  "pluginsContext": {
    "filterTags": {
      "tags": ["user", "combined"]
    }
  }
}
```

## Notes

- `plugins` lists plugin names.
- `pluginsContext` passes plugin-specific config.
- External plugins are loaded from `_markbind/plugins`.

## User Guide Source

- <https://markbind.org/userGuide/usingPlugins.html>
