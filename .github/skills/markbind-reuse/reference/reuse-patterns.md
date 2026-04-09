# Reuse Patterns

## Reusing Across Pages

Organize shared fragments in common folders and include by relative path.

## Reusing Across Sites

Keep a sub-site inside the main site directory and include sub-site pages directly.

```html
<include src="sub-site/overview.md" />
```

## Exclude Fragments from Page Generation

If fragments match page globs, use `pagesExclude`:

```json
{
  "pagesExclude": ["**/*-fragment.md"]
}
```

## User Guide Sources

- <https://markbind.org/userGuide/reusingContents.html>
- <https://markbind.org/userGuide/siteJsonFile.html#pagesexclude>
