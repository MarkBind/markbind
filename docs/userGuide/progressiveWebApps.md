{% set title = "Progressive Web Apps" %}
{% set filename = "progressiveWebApps" %}

<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

MarkBind can initialize sites with basic PWA functionality.
</div>

During initialization, add the `--pwa` flag to tell MarkBind to bundle PWA requirements. For example:

```
markbind init --pwa
```

After doing so, update the `manifest.json` and `sw.js` files to achieve desired functionality.

## Adding PWA functionality to an existing app

For an already-existing app, the following steps add PWA functionality:

1. Set **"pwa": true** in the site's configuration file (`site.json`) at the root-level:
```json {.line-numbers highlight-lines="6[:]"}
{
  "baseUrl": "/myproduct",
  "faviconPath": "myfavicon.png",
  "titlePrefix": "FooBar Dev Docs",
  "titleSuffix": "FooBar",
  "pwa": true,
  ...
}
```
2. Add a manifest file named **manifest.json** in the **root folder** of the site.
3. Populate the manifest with required values. See MDN's guide [here](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) for more info.
4. Optionally, add a service worker named **sw.js** in the **root folder** of the site.

<box type="warning">
  <markdown>
Note: The file names and directory structure of **manifest.json** and **sw.js** should strictly be adhered to. MarkBind currently does not support multiple service workers.
  </markdown>
</box>
