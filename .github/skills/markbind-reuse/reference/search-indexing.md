# Search Indexing Controls

## Inline Keywords

```html
<span class="keyword">searchable term</span>
```

## Hidden Keywords

```html
<span class="keyword d-none">synonym alternate-term</span>
```

## Page-Level Keywords

```html
<frontmatter>
  keywords: "keyword1, keyword2, keyword3"
</frontmatter>
```

## Heading Index Controls

```markdown
## Important Heading {.always-index}
## Skip This Heading {.no-index}
```

## User Guide Source

- <https://markbind.org/userGuide/makingTheSiteSearchable.html>
