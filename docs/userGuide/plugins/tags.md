{{ topHeadingLevel or "###" }} Plugin: Tags

With this plugin you can use tags to selectively filter content when building a site.

#### Toggling alternative contents

Tags are specified by the `tags` attribute, **and can be attached to any HTML element**. During rendering, only elements that match tags specified in the `site.json` files will be rendered.

<div class="indented">

{{ icon_example }} Attaching tags to elements:
```html
# Print 'Hello world'

<p tags="language--java">System.out.println("Hello world");</p>
<p tags="language--C#">Console.WriteLine("Hello world");</p>
<p tags="language--python">print("Hello world")</p>
```

You need to specify the tags to include in the `pluginsContext`, under `tags`:

```json
{
  ...
  "plugins" : [
    "filterTags"
  ],
  "pluginsContext" : {
    "filterTags" : {
      "tags": ["language--java"]
    }
  }
}
```

All other tagged elements will be filtered out. In this case, only the element with the `language--java` tag will be rendered. This is helpful when creating multiple versions of a page without having to maintain separate copies.

</div>

If the `filterTags` plugin is not enabled in `site.json`, all tagged elements will be rendered.

**You can also use multiple tags in a single HTML element. Specify each tag in the `tags` attribute** separated by a space. An element will be rendered if **any of the tags** matches the one in `site.json`.

<div class="indented">

{{ icon_example }} Attaching multiple tags to an element:
```html
# For loops

<p tags="language--java language--C#">for (int i = 0; i < 5; i++) { ... }</p>
```

As long as the `language--java` or `language--C#` tag is specified, the code snippet will be rendered.

</div>

Alternatively, you can specify tags to render for a page in the front matter.

<div class="indented">

{{ icon_example }} Specifying tags in front matter:
```html
<frontmatter>
  title: "Hello World"
  tags: ["language--java"]
</frontmatter>
```
</div>

<span id="short" class="d-none">

```html
<p tags="language--java advanced">System.out.println("Hello world");</p>
<p tags="language--C# basic">Console.WriteLine("Hello world");</p>
```
```html
<frontmatter>
  title: "Hello World"
  tags: ["language--java"]
</frontmatter>
```
</span>

Tags in `site.json` will be merged with the ones in the front matter, and are processed after front matter tags. See [Hiding Tags](../tweakingThePageStructure.html#hiding-tags) for more information.

#### Advanced Tagging Tips

You can use a `*` in a tag name to match elements more generally. A `*` in a tag will match any number of characters at its position.

<div class="indented">

{{ icon_example }} Using general tags:
```html
<frontmatter>
  title: "Hello World"
  tags: ["language--*"]
</frontmatter>

<p tags="language--java">System.out.println("Hello world");</p>
<p tags="language--C#">Console.WriteLine("Hello world");</p>
<p tags="language--python">print("Hello world")</p>
```

All 3 `<p>`s will be shown.

</div>

#### Hiding Tags

Using `-` at the start of a tag hides all tags matching the expression. This is helpful for disabling a group of tags and enabling a particular tag.

<div class="indented">

{{ icon_example }} Using general tags:
```html {heading="index.md"}
<frontmatter>
  title: "Hello World"
  tags: ["language--java"]
</frontmatter>

<p tags="language--java">System.out.println("Hello world");</p>
<p tags="language--C#">Console.WriteLine("Hello world");</p>
<p tags="language--python">print("Hello world")</p>
```

```json {heading="site.json"}
{
  ...
  "plugins" : [
    "filterTags"
  ],
  "pluginsContext" : {
    "filterTags" : {
      "tags": ["-language--*", "language--C#"]
    }
  }
}
```

`language--java` is overridden by `-language--*`, so only `language--C#` is shown.

</div>

This only works because tags are processed left to right, so all `language--*` tags are hidden before `language--C#`. Tags in `site.json` are processed after tags in `<frontmatter>`.

<span id="short" class="d-none">

```html
# Print 'Hello world'

<p tags="language--java">System.out.println("Hello world");</p>
<p tags="language--C#">Console.WriteLine("Hello world");</p>
<p tags="language--python">print("Hello world")</p>
```
```json
{
  ...
  "plugins" : [
    "filterTags"
  ],
  "pluginsContext" : {
    "filterTags" : {
      "tags": ["language--java"]
    }
  }
}
```
</span>
