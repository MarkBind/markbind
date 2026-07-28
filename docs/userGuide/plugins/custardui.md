### Plugin: CustardUI

<div id="content">

This plugin automatically injects the [CustardUI](https://custardui.js.org/) auto-init script into the page, enhancing generated static sites with more interactivity and personalization. 

<box type="info">

CustardUI provides additional custom elements like `<cv-toggle>`, `<cv-tabgroup>`, placeholders, page highlighting capabilities, and more.

</box>

To enable this plugin, add `custardui` to your site's plugins.

```js {heading="site.json"}
{
  ...
  "plugins": [
    "custardui"
  ]
}
```

<panel header="Optional: Specifying a Base URL">

By default, the plugin sets the `data-base-url` attribute for CustardUI to `/`. If you are hosting your site in a subdirectory or need to customize this base URL, you can configure it under `pluginsContext`.

```js {heading="site.json"}
{
  ...
  "pluginsContext": {
    "custardui": {
      "baseUrl": "/my-base-url"
    }
  }
}
```

</panel>

<br>

**Adding a CustardUI configuration file**:

After enabling the plugin, create a `custardui.config.json` file in your site's root directory. This tells CustardUI what options and features to expose to your readers.

<box type="tip">

Make sure your `site.json` ignore list does not exclude JSON files, or MarkBind will not copy `custardui.config.json` into the generated site and the plugin will not work.

</box>

Here is a sample configuration with the settings panel enabled:

```json {heading="custardui.config.json"}
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "macOS", "description": "Show macOS instructions" },
      { "toggleId": "win", "label": "Windows", "description": "Show Windows instructions" }
    ]
  },
  "settings": {
    "enabled": true
  }
}
```

With this configuration, readers will see a settings panel they can use to switch between viewing macOS and Windows content. For more information, check out the [CustardUI documentation](https://custardui.js.org/).

</div>
