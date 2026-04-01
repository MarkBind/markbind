{% set title = "Dark Mode" %}
{% set filename = "darkMode" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# Dark Mode

<div class="lead" id="overview">

**MarkBind now supports _dark mode_**

</div>

#### Enabling Dark Mode

You can enable dark mode for your site by using the [`style.darkMode` property](siteJsonFile.html#style) of your `site.json` configuration file.

```json {heading="site.json"}
{
  "style": {
    "darkMode": true
  }
}
```

Enabling dark mode causes the site to default to the user's system preference.
Readers can also switch between light and dark mode at any time using the
`<dark-mode-toggle/>` component, which appears in the navigation bar to the
right of the search bar. This setting will be remembered for future visits to
the site.

#### Adapting Existing Sites to Dark Mode

##### Updating stylesheet

After enabling dark mode, replace your `/css/main.css` in your markbind site
directory with the latest version [here](https://github.com/yihao03/markbind/raw/05d686b4375078a6d4200e15dcef4831bd37f61e/docs/css/main.css)
to override the default Bootstrap styles with the new dark mode compatible styles.

##### Adapting your contents

We recognise that some of your existing contents e.g. images with transparent
backgrounds and diagrams might have some visibility issues when viewed in dark
mode. We recommend that:

- You wrap your images in a `<box>` tag with light background to improve visibility.

    ```md
    <box background-color="#f8f9fa">
      your existing content
    </box>
    ```

- Adapt your diagrams to use colours that are more visible in both modes

{% from "njk/common.njk" import previous_next %}
{{ previous_next('themes', 'deployingTheSite') }}
