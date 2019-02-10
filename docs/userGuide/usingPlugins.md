<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Using Plugins

A plugin is a user-defined extension that can add custom features to MarkBind. MarkBind plugins are `js` scripts that are loaded and run during the page generation. MarkBind allows plugins to modify a page's content during the page generation process.

<tip-box type="warning">

**WARNING:** Plugins are executable programs that can be written by anyone. This means that they might contain malicious code that may damage your computer.

Only run plugins from sources that you trust. Do not run the plugin if the source/origin of the plugin cannot be ascertained.
</tip-box>

### Adding Plugins

Plugins are stored in the `_markbind/plugins` folder which is generated on `init`. To use a plugin, place the `js` source of the plugin in the `_markbind/plugins` folder and add the following options to `site.json`:

- `plugins`: An array of plugin names to use.
- `pluginsContext`: A mapping of plugin names to parameters passed to each individual plugin. It is recommended to use key-value pairs for consistency.

For example:

```js
{
  ...
  "plugins": [
    "plugin1",
    "plugin2",
  ],
  "pluginsContext": {
    "plugin1": {
    	"input": "Input for Plugin 1"
    },
    "plugin2": {
    	"data": "Data for Plugin 2"
    },
  }
}
```

### Writing Plugins

![MarkBind Rendering]({{baseUrl}}/images/rendering.png)

MarkBind provides two entry points for modifying the page, pre-render and post-render. These are controlled by implementing the `preRender()` and `postRender()` functions in the plugin:

- `preRender(content, pluginContext, frontMatter)`: Called before MarkBind renders the source from Markdown to HTML.
  - `content`: The raw Markdown of any Markdown file (`.md`, `.mbd`, etc.).
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
- `postRender(content, pluginContext, frontMatter)`: Called after the HTML is rendered, before writing it to a file.
  - `content`: The rendered HTML.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.

MarkBind will call these functions with the respective content, and retrieve a string data that is used for the next step of the page generation process.

An example of a plugin is shown below. The plugin shows two ways of appending a paragraph of text to a specific `div` in the Markdown files:

```js
// myPlugin.js

const cheerio = module.parent.require('cheerio');

module.exports = {
  preRender: (content, pluginContext, frontMatter) => content.replace('[Pre-render Placeholder]', `${pluginContext.pre}`),
  postRender: (content, pluginContext, frontMatter) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('#my-div').append(pluginContext.post);
    return $.html();
  },
};
```

```js
// site.json

{
  ...
  "plugins": [
    "myPlugin"
  ],
  "pluginsContext": {
    "myPlugin": {
      "pre": "<p>Hello</p>",
      "post": "<p>Goodbye</p>"
    }
  }
}
```

```md
// index.md

...
<div id="my-div">
[Pre-render Placeholder]
</div>
```

### Built-in plugins

MarkBind has a set of built-in plugins that can be used immediately without installation.

#### `filterTags`: Toggling alternative contents in a page

You can use tags to selectively filter HTML elements when building a site.

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

Tags in `site.json` will take precedence over the ones in the front matter.

</div>
