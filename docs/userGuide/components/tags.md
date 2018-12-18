## Tags

**Tags are used to selectively filter certain elements on web pages.**

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

When compiled, only elements that match tags specified in the `site.json` files will be displayed. All other tagged elements will be hidden. In this case, only the element with the `language--english` tag will be displayed. This is helpful when creating multiple versions of a page without having to maintain separate copies. If this option is not specified, all tagged elements will be displayed.

**You can also use multiple tags in a single HTML element. Specify each tag in the `tag` attribute** separated by a space. An element will be displayed if **any of the tags** matches the one in site.json.

```html
<p tag="language--english language--spanish">No!</p>
<p tag="language--french">Non!</p>
```

Alternatively you can also specify tags for a page individually in the page's `frontmatter`:

```
<frontmatter>
  title: "Hello World"
  tags: ["language--english"]
</frontmatter>
```

Tags in the `frontmatter` will take precedence over the ones in `site.json`.
