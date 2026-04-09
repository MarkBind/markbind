# Search and Indexing

## Site-Level Heading Indexing

```json
{
  "headingIndexingLevel": 4
}
```

## Page-Level Search Exclusion

```json
{
  "pages": [{
    "src": "internal.md",
    "searchable": "no"
  }]
}
```

## Pagefind Config

```json
{
  "pagefind": {
    "exclude_selectors": [".no-search", "[data-no-index]"]
  }
}
```

## User Guide Sources

- <https://markbind.org/userGuide/makingTheSiteSearchable.html>
- <https://markbind.org/userGuide/siteJsonFile.html#headingindexinglevel>
