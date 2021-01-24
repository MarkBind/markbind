{% set title = "Using Plugins" %}
{% set filename = "usingPlugins" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
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
<include src="plugins/disqus.mbdf" />

## Using External Plugins

### Adding External Plugins

<tip-box type="warning">

**WARNING:** Plugins are executable programs that can be written by anyone. This means that they might contain malicious code that may damage your computer.

Only run plugins from sources that you trust. Do not run the plugin if the source/origin of the plugin cannot be ascertained.
</tip-box>

Plugins come as `.js` files. To install an external plugin, simply put it in the `_markbind/plugins` folder. To use the plugin, update the `site.json` file the same way you did for built-in plugins.


## Writing Plugins

You may also write your own plugins! Refer [here](https://markbind.org/devdocs/devGuide/writingPlugins.html) for the available interfaces to do so.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('settingSiteProperties', 'makingTheSiteSearchable') }}
