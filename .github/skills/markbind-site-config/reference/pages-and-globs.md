# Pages and Globs Configuration

## Page Entry

```json
{
  "src": "guide/index.md",
  "title": "Guide",
  "layout": "guide",
  "searchable": "yes",
  "externalScripts": ["script.js"],
  "frontmatter": { "header": "header.md" },
  "fileExtension": ".html"
}
```

## Glob Entry

```json
{
  "glob": "topics/**/*.md",
  "globExclude": ["topics/*/appendix/*.md"],
  "layout": "topic"
}
```

## Related Global Exclusions

```json
{
  "pagesExclude": ["subsite/**/*.md"]
}
```

## User Guide Source

- <https://markbind.org/userGuide/siteJsonFile.html#pages>
