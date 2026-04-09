# Headings

## Syntax

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

## Auto-generated Anchors

Headings automatically generate anchors:
- Lowercase
- Special characters removed
- Spaces replaced with hyphens

Example:
- `## My Heading` → `#my-heading`
- `## API (v2)` → `#api-v2`

## Manual Anchors

```markdown
<span id="custom-anchor"></span>
## My Heading
```

Or use Pandoc-style:
```markdown
## My Heading {#custom-anchor}
```

## Always Index / No Index

```markdown
## Important Heading {.always-index}
## Skip This Heading {.no-index}
```

Use `.always-index` to include headings below `headingIndexLevel` in search.
Use `.no-index` to exclude headings from search.