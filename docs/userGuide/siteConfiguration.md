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
| **baseUrl** | The base url relative to your domain. Default: <code></code>&nbsp;(empty). For example, if you are using Github Pages to host your deployed website and it is published at `https://markbind.github.io/site-demo-cs2103`, then your `baseUrl` would be `/site-demo-cs2103`. You can use this variable for [specifying path reference](contentAuthoring.html#specifying-path-reference) of images and links. **You may need to change the `baseUrl` when deploying to a different repo.** |
| **faviconPath** | The location of the favicon. Default: `favicon.ico`. If the favicon was recently changed, you may need to force-refresh to see the new image. |
| **titlePrefix** | The prefix for all page titles. The separator <code>-</code> will be inserted by MarkBind. |
| **pages** | An array of pages to be rendered. The `src` is the file; `title` is the page title for the generated web page. Titles specified here take priority over titles specified in the [front matter](contentAuthoring.html#front-matter) of individual pages. Alternatively, `glob` can be used to define a file pattern. If `title` is not specified in the front matter, the page will have `titlePrefix` as its title. |
| **ignore** | An array of file patterns to be ignored. By default, MarkBind will copy all the files as assets into the output folder. The ignore pattern follows the [glob pattern used in .gitignore](https://git-scm.com/docs/gitignore#_pattern_format). For example, `*.md` ignores all markdown source files. You may want to ignore the Git directory `.git/*`. |
| **deploy** | The settings for [auto deployment to Github pages](ghpagesDeployment.html). The `message` is the commit message used for the deployment commit. |
</div>

<include src="../common/userGuideSections.md" />

</div>
