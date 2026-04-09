# site.json Essentials

## Minimal Example

```json
{
  "baseUrl": "",
  "pages": [
    { "src": "index.md" }
  ]
}
```

## Core Properties

- `baseUrl`
- `pages` / `pagesExclude`
- `ignore`
- `globalOverride`
- `externalScripts`
- `deploy`
- `plugins` / `pluginsContext`
- `headingIndexingLevel`
- `timeZone` / `locale`
- `intrasiteLinkValidation`
- `plantumlCheck`

## Precedence Rules

- `pages` entry (`src`) overrides matching page frontmatter.
- Matching `src` entries have priority over matching `glob` entries.
- If multiple globs match, later entries win on conflicts.

## User Guide Sources

- <https://markbind.org/userGuide/siteJsonFile.html>
- <https://markbind.org/userGuide/settingSiteProperties.html>
