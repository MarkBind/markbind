<link rel="stylesheet" href="{{baseUrl}}/css/main.css">

<include src="../common/header.md" />

<div class="website-content">

# Site Configuration

You can configure your site generation using the `site.json` file.

Let's examine a typical `site.json` file:
```
{
  "baseUrl": "",
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World"
    }
  ],
  "ignore": [
    "_site/*",
    "*.json",
    "*.md"
  ],
  "deploy": {
    "message": "Site Update."
  }
}

```

| Variable | Description |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **baseUrl** | The url base when you deploy the website. For example, if you are using Github Pages to host your deployed website, and the resulted page is `https://markbind.github.io/site-demo-cs2103`, then your `baseUrl` would be `/site-demo-cs2103` (relative to your domain, default is ` ` (empty)). Later you could use this variable to help you create top-level navigation link in the document. **You may need to change the `baseUrl` when deploy to different repo.** |
| **pages** | An array of the pages config tells MarkBind all the source files that needs to be rendered. The `src` is the page to be rendered; `title` is the page title for the generated web page. |
| **ignore** | Files to be ignored when building the website. By default, MarkBind will copy all the assets into the output folder. The ignore pattern follows the pattern used in [`.gitignore`](https://git-scm.com/docs/gitignore#_pattern_format). You may want to ignore all markdown source files by adding the entry `*.md`, as well as the Git working directory `.git/*`. |
| **deploy** | Settings for the auto Github page deployment. Please refer this [doc](ghpagesDeployment.html) for more details. |

<include src="../common/userGuideSections.md" />

</div>
