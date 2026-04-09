# Includes

## Basic Include

```html
<include src="file.md" />
```

## Include a Fragment

```html
<include src="file.md#section-id" />
```

The source fragment should be wrapped with an element that has matching `id`.

## Include Attributes

- `src`: file path (supports `#fragment`)
- `inline`: include as inline wrapper
- `optional`: do not error if file/fragment is missing
- `trim`: trim leading/trailing whitespace
- `omitFrontmatter`: remove included file frontmatter

## Include Variables

```html
<include src="article.md">
  <variable name="title">My Title</variable>
  <variable name="author">John Doe</variable>
</include>
```

You can also pass inline include vars:

```html
<include src="article.md" var-title="My Title" var-author="John Doe" />
```

## Important Behavior

- Include paths are resolved relative to the included file's original location.
- Outer include variables override inner include variables in include chains.

## User Guide Sources

- <https://markbind.org/userGuide/reusingContents.html#includes>
- <https://markbind.org/userGuide/syntax/includes.html>
