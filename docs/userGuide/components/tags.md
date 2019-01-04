## Tags

You can use tags to selectively filter HTML elements when building a site.

Tags are specified by the `tags` attribute, **and can be attached to any HTML element**. For example:

```html
# Welcome to my site

<p tags="language--english">Hello</p>
<div tags="language--french">Bonjour</div>
<span tags="language--spanish">Hola</span>
```

You need to specify the tags to include in `site.json`, under the `tags` option:

```
{
  ...
  "tags": ["language--english"]
}
```

During rendering, only elements that match tags specified in the `site.json` files will be rendered. All other tagged elements will be filtered out. In this case, only the element with the `language--english` tag will be rendered. This is helpful when creating multiple versions of a page without having to maintain separate copies. If this option is not specified, all tagged elements will be rendered.

**You can also use multiple tags in a single HTML element. Specify each tag in the `tags` attribute** separated by a space. An element will be rendered if **any of the tags** matches the one in `site.json`.

```html
<p tags="language--english language--spanish">No!</p>
<p tags="language--french">Non!</p>
```

Alternatively, you can also specify tags to render for a page in the front matter.

```
<frontmatter>
  title: "Hello World"
  tags: ["language--english"]
</frontmatter>
```

Tags in `site.json` will take precedence over the ones in the front matter.
