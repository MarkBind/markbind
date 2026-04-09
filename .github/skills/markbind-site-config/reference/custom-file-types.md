# Custom File Types

## Generate Non-HTML Outputs

Use `fileExtension` in page entries:

```json
{
  "pages": [{
    "src": "config.md",
    "fileExtension": ".json",
    "searchable": "no"
  }]
}
```

## Notes

- Common outputs include `.json` and `.txt`.
- Non-HTML outputs do not support frontmatter/scripts.

## User Guide Sources

- <https://markbind.org/userGuide/siteJsonFile.html#pages>
- <https://markbind.org/userGuide/customFileTypes/sampleJson.html>
- <https://markbind.org/userGuide/customFileTypes/sampleTxt.html>
