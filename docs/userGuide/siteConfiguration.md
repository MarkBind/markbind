<include src="../common/header.md" />

<div class="website-content">

# Site Configuration

You can configure your site generation using the `site.json` file.

Let's examine a typical `site.json` file:

<div id="siteConfig">

```
{
  "baseUrl": "",
  "faviconPath": "favicon.png",
  "titlePrefix": "",
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World"
    },
    {
      "glob": "**/index.md"
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
| **faviconPath** | The location of the favicon. Default: `favicon.ico`. Note: If the favicon was recently changed, when viewing the website, you may need to force-refresh to see the new favicon. |
| **titlePrefix** | The prefix for all page titles. This prefix will be prepended to all rendered pages. |
| **pages** | An array of the pages config tells MarkBind all the source files that needs to be rendered. The `src` is the page to be rendered; `title` is the page title for the generated web page. Titles specified in this array will take priority over titles specified within the front matter of individual pages. In addition, globs can be used to define pages that will be rendered. Front matter for the pages will be automatically indexed. However, if front matter or `title` is not specified, the page will have a default title that consists only of the `titlePrefix`. |
| **ignore** | Files to be ignored when building the website. By default, MarkBind will copy all the assets into the output folder. The ignore pattern follows the pattern used in [`.gitignore`](https://git-scm.com/docs/gitignore#_pattern_format). You may want to ignore all markdown source files by adding the entry `*.md`, as well as the Git working directory `.git/*`. |
| **deploy** | Settings for the auto Github page deployment. Please refer this [doc](ghpagesDeployment.html) for more details. |
</div>

<include src="../common/userGuideSections.md" />

</div>
