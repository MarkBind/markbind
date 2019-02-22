<variable name="title">Using Plugins</variable>

<frontmatter>
  title: "User Guide: {{ title }}"
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

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

<include src="plugins/filterTags.mbdf" />
