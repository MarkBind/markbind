{% set title = "Writing Plugins" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

MarkBind plugins are `js` scripts that are loaded and run during the page generation. MarkBind allows plugins to modify a page's content during the page generation process, amongst other things.

This page details the available interfaces you may use to write plugins.

## Rendering

![MarkBind Rendering]({{baseUrl}}/images/rendering.png)

MarkBind provides two entry points for modifying the page generated - `processNode` and `postRender`.

`processNode` operates during the html processing stage of MarkBind, where each node (html element) processed is passed
to the entry point.

In most cases, this is sufficient, and more performant since this ties directly into MarkBind's html processing.

However, if you need to operate on the page as a whole, or you need access to the front matter of the page, you may use the `postRender` interface instead, which operates on the html content after it is processed by MarkBind.

- `processNode(pluginContext, node)`: Called before MarkBind renders the source from Markdown to HTML.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `node`: A [domhandler](https://github.com/fb55/domhandler) node object, which represents a html element.
    This object may be directly manipulated for simple operations, or operated on using [cheerio](https://cheerio.js.org/).
- `postRender(pluginContext, frontMatter, content)`: Called after the HTML is rendered
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
  - `content`: The rendered HTML.
  - **Returns:** the post-processed html string

<box type="info">

Note that both of these interfaces are executed independently on a page, a layout or an
<popover>
<template slot="content">
Something referenced by a panel with a `src` attribute (`<panel src="...">`).
</template>
external
</popover>.

That is, the dom tree being processed during `processNode` and the content passed into `postRender` will belong to either one of these types of files.
</box>

An example of a plugin is shown below. The plugin shows two ways of appending a paragraph of text to a specific `div` in the Markdown files:

```js
// myPlugin.js

const cheerio = module.parent.require('cheerio');

module.exports = {
  processNode: (pluginContext, node) => {
    if (node.attribs.id === 'my-div') {
      cheerio(node).append(pluginContext.content);
    }
  },
  postRender: (pluginContext, frontMatter, content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('#my-div').append(pluginContext.content);
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
      "content": "<p>Hello World</p>",
    }
  }
}
```

```md
// index.md

...
<div id="my-div">
</div>
```

## Assets

Plugins can implement the methods `getLinks` and `getScripts` to add additional assets to any page.

- `getLinks(pluginContext, frontMatter, content)`: Called to get link elements to be added to the head of the page.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
  - `content`: The rendered HTML.
  - **Returns:** an array of strings containing link elements to be added.
- `getScripts(pluginContext, frontMatter, content)`: Called to get script elements to be added after the body of the page.
  - `pluginContext`: User provided parameters for the plugin. This can be specified in the `site.json`.
  - `frontMatter`: The frontMatter of the page being processed, in case any frontMatter data is required.
  - `content`: The rendered HTML.
  - **Returns:** an array of strings containing script elements to be added.

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
  getLinks: (pluginContext, frontMatter, content) => ['<link rel="STYLESHEET_LINK">'],
  getScripts: (pluginContext, frontMatter, content) => [
    '<script src="SCRIPT_LINK"></script>',
    '<script>alert("hello")</script>'
  ],
};

```

This will add the following link and script elements to the page:
- `<link rel="stylesheet" href="STYLESHEET_LINK">`
- `<script src="SCRIPT_LINK"></script>`
- `<script>alert("hello")</script>`

## Tag Behaviour

MarkBind also provides several convenient interfaces that can be used alone, or in conjunction with the [rendering](#rendering) interfaces to modify how tags are processed.

To use these interfaces, add the `tagConfig` property to your plugin export:

```js
module.exports = {
  tagConfig: {
    puml: {
      isSpecial: true,
      attributes: [
        {
          name: 'src',
          isRelative: true,
          isSourceFile: true,
        },
      ],
    },
  },
}
```

**Tag Properties**

Tag properties are top-level properties of the tag configuration object. The following table lists what these properties are used for:

Property | Values | Default | Remarks
:----- | ------- | ---- | ----
`isSpecial` | `true` or `false` | `false` | Allows configuring whether any tag is to be parsed "specially" like a `<script>` or `<style>` tag. This allows configuring custom tags that may contain conflicting syntax, such as the `<puml>` tag used for UML diagram generation.
`attributes` | Array of attribute configurations | `[]` | Contains the attribute configurations of the tags.

**Attribute Properties**

The following table lists what the possible properties for configuring the attributes of a tag, and what they are used for:

Property | Values | Default | Remarks
:----- | ------- | ---- | ----
`name` | attribute name | none | The string name of the attribute.
`isRelative` | `true` or `false` | `false` | Should be `true` if this attribute may contain a relative link. This tells MarkBind to properly resolve such relative links when used in `<include>`s, by converting the link into a `baseUrl` preceded absolute link.
`isSourceFile` | `true` or `false` | `false` | Should be `true` if the attribute points to a source file. This allows flagging other source files to trigger page regeneration during live reload.

## Lifecycle hooks

You may also need to maintain some plugin state during site generation, then reset this when the site or pages are regenerated.

To do this, you may implement the `beforeSiteGenerate` method.

- `beforeSiteGenerate()`: Called during initial site generation and subsequent regenerations during live preview.
  - No return value is required.
