<variable name="title" id="title">Using Plugins</variable>
<variable name="filename" id="filename">usingPlugins</variable>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide
  pageNav: "default"
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

A plugin is an extension that adds additional features to MarkBind. Some non-essential MarkBind functionalities are provided as plugins so that you can enable/disable/configure them as necessary. MarkBind also supports adding external plugins (written by you or other third parties).
</div>

<box type="info">

MarkBind's philosophy is to _bake-in_ all necessary functionality into MarkBind itself rather than expect users to go hunting for suitable plugins. Hence, we do not anticipate MarkBind users to rely heavily on such external plugins.
</box>

## Managing Plugins

Plugins are managed via the following two properties in the `site.json`.

* `plugins`: An array of plugin names to use.
* `pluginsContext`: Parameters passed to each plugin, specified as key-value pairs.

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
    }
  }
}
```

## Using Built-in Plugins


MarkBind has a set of built-in plugins that can be used immediately without installation.

<include src="plugins/algolia.mbdf" />
<include src="plugins/codeBlockCopyButtons.mbdf" />
<include src="plugins/tags.mbdf" />
<include src="plugins/googleAnalytics.mbdf" />

## Using External Plugins

### Adding External Plugins

<tip-box type="warning">

**WARNING:** Plugins are executable programs that can be written by anyone. This means that they might contain malicious code that may damage your computer.

Only run plugins from sources that you trust. Do not run the plugin if the source/origin of the plugin cannot be ascertained.
</tip-box>

Plugins come as `.js` files. To install an external plugin, simply put it in the `_markbind/plugins` folder. To use the plugin, update the `site.json` file the same way you did for built-in plugins.

### Writing Plugins

MarkBind plugins are `js` scripts that are loaded and run during the page generation. MarkBind allows plugins to modify a page's content during the page generation process.

#### Rendering

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

#### Assets

Plugins can implement the methods `getLinks` and `getScripts` to add additional assets to the page.

- `getLinks(content, pluginContext, frontMatter, utils)`: Called to get link elements to be added to the head of the page.
  - `content`: The rendered HTML.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
  - `utils`: Object containing the following utility functions
    - `buildStylesheet(href)`: Builds a stylesheet link element with the specified `href`.
  - Should return an array of strings containing link elements to be added.
- `getScripts(content, pluginContext, frontMatter, utils)`: Called to get script elements to be added after the body of the page.
  - `content`: The rendered HTML.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
  - `utils`: Object containing the following utility functions
    - `buildScript(src)`: Builds a script element with the specified `src`.
  - Should return an array of strings containing script elements to be added.

<box type="success" header="Local assets">
<md>
You can set an absolute or relative file path as the `src` or `href` attribute in your `<script>` or `<link>` tags.
MarkBind will copy these assets into the output directory and change the `src` or `href` attributes automatically!
</md>
</box>

An example of a plugin which adds links and scripts to the page:

```js
// myPlugin.js

module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet('STYLESHEET_LINK')],
  getScripts: (content, pluginContext, frontMatter, utils) =>
    [utils.buildScript('SCRIPT_LINK'), '<script>alert("hello")</script>'],
};

```

This will add the following link and script elements to the page:
- `<link rel="stylesheet" href="STYLESHEET_LINK">`
- `<script src="SCRIPT_LINK"></script>`
- `<script>alert("hello")</script>`

#### Live reload

By default, MarkBind treats `.html`, `.md`, `.mbd`, and `.mbdf` as source files, and will rebuild any
pages changed when serving the page.

During the `preRender` and `postRender` stages however, plugins may do custom processing using some other
source file types, as parsed from the raw Markdown, typically requiring rebuilding the site.

Hence, to add custom source files to watch, you can implement the `getSources()` method.

`getSources(content, pluginContext, frontMatter)`: Called _before_ a Markdown file's `preRender` function is called.
- `content`: The raw Markdown of the current Markdown file (`.md`, `.mbd`, etc.).
- `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
- `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.

It should return an object, consisting of _at least one of the following fields_:
- `tagMap`: An array consisting of `['tag name', 'source attribute name']` key value pairs.
  - MarkBind will automatically search for matching tags with the source attributes, and watch them.
  - For relative file paths, _if the tag is part of some included content_ ( eg. `<include />` tags ), it will be resolved against the included page. Otherwise, it is resolved against the page being processed.
- `sources`: An array of source file paths to watch, where relative file paths are resolved only against the page being processed.
- You can also directly return an array of source file paths to watch. ( ie. the `sources` field ) ___(deprecated)___

Example usage of `getSources` from the PlantUML plugin, which allows insertion of PlantUML diagrams using `<puml src="..." >` tags.
This allows files specified by the `src` attributes of `<puml>` tags to be watched:

```js
{
  ...
  getSources: () => ({
    tagMap: [['puml', 'src']],
  })
}
```

#### Special tags

By default, content in html tags are parsed as html and markdown.

However, you might want to create a plugin that has certain special tags containing conflicting syntax
you do not wish to be parsed as html or markdown.

You can implement the `getSpecialTags` method to blacklist the content in these special tags from parsing,
removing such potential conflicts.

- `getSpecialTags(pluginContext)`: Called during initial site generation to blacklist special tags.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - Should return an array of string tag names to be blacklisted, with each tag name being at least 2 characters long.

<box type="important">

Note however, that variable interpolation syntax {% raw %}`{{ variable_name }}`{% endraw %} will act as per normal.
Meaning, the user would still be able to use variables in your special tags!
</box>


{% from "njk/common.njk" import previous_next %}
{{ previous_next('settingSiteProperties', 'makingTheSiteSearchable') }}
