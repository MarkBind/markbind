<frontmatter>
  title: "Configuring the Site"
  footer: footer.md
  siteNav: userGuideSections.md
  keywords: site.json
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Configuring the Site

<span class="lead">

The `site.json` file {{ tooltip_root_directory }} is used to configure various aspects of a MarkBind website.
</span>

Here is a typical `site.json` file:

```json
{
  "baseUrl": "/myproduct",
  "faviconPath": "myfavicon.png",
  "titlePrefix": "FooBar Dev Docs",
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World",
      "layout": "normal",
      "searchable": "no"
    },
    {
      "glob": "**/index.md"
    }
  ],
  "deploy": {
    "message": "Site Update.",
    "repo": "https://github.com/myorg/myrepo.git",
    "branch": "gh-pages"
  },
  "ignore": [
    "_site/*",
    "*.json",
    "*.md",
    "*.mbd",
    ".git/*"
  ],
  "headingIndexingLevel": 4
}
```

#### **`baseUrl`**

**The base url relative to your domain.** Default: `""`(empty).

<include src="deployingTheSite.md#warning-about-baseUrl" />


#### **`faviconPath`**

**The location of the favicon.** Default: `favicon.ico`.

<div class="indented">

%%{{ icon_info }} If the favicon was recently changed, you may need to force-refresh the Browser to see the new image.%%

</div>


#### **`titlePrefix`**

**The prefix for all page titles.** The separator <code>-</code> will be inserted by MarkBind.


#### **`pages`**

**An array of pages to be rendered.**

* **`src`**/**`glob`**: `src` can be used to specify a file e.g., `docs/index.md`.<br>
    Alternatively, `glob` can be used to define a file pattern in the [_glob syntax_](https://en.wikipedia.org/wiki/Glob_(programming)) e.g., `**/*.md`.
* **`title`**: The page `<title>` for the generated web page. Titles specified here take priority over titles specified in the [front matter](addingPages.html#front-matter) of individual pages.
* **`layout`**: The [layout]({{ baseUrl }}/userGuide/advancedTopics.html#page-layout) to be used by the page. Default: `default`.
* **`searchable`**: Specifies that the page(s) should be excluded from searching. Default: `yes`.

<span id="page-property-overriding">
<box type="warning">

Note: Page properties that are defined in `site.json` for a particular page will override those defined in the front matter of the page.
</box>
</span>

#### **`ignore`**

**An array of file patterns to be ignored when copying files to the generated site.** By default, MarkBind will copy all the files as assets of the generated site.

The ignore pattern follows the [glob pattern used in .gitignore](https://git-scm.com/docs/gitignore#_pattern_format). For example, `*.md` ignores all markdown source files.

<div id="site-json-deploy">

#### **`deploy`**

**The settings for [auto-deployment to Github pages]({{ baseUrl }}/userGuide/deployingTheSite.html).**

* **`message`** [Optional. Default: `"Site Update."`]<br>
  The commit message used for the deployment commit.

* **`repo`** [Optional. Default: the current working project's repo]<br>
  The repo you want to deploy to.<br>
  Format: `"https://github.com/<org|username>/<repo>.git"` (`"git@github.com:<org|username>/<repo>.git"` if you use SSH)<br>
  {{ icon_example }} `"https://github.com/myorg/myrepo.git"`

* **`branch`** [Optional. Default: `"gh-pages"`]<br>
  The branch that will be deployed to in the remote repo.
</div>

#### **`headingIndexingLevel`**

**The level of headings to be indexed for searching.** Default: `3` %%i.e., only headings of levels 1,2,3 will be indexed for searching%%.

#### **`enableSearch`**

**Specifies that the website should use MarkBind's search functionality.** Default: `true`. See [User Guide: Making the Site Searchable]({{ baseUrl }}/userGuide/makingTheSiteSearchable.html) for more details.

</div>
