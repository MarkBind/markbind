<frontmatter>
  title: "Configuring the Site"
  footer: footer.md
  siteNav: userGuideSections.md
  keywords: site.json
</frontmatter>

<include src="../common/header.md" />

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
      "searchable": "no",
      "externalScripts": [
        "https://cdn.plot.ly/plotly-latest.min.js"
      ]
    },
    {
      "glob": "**/index.md"
    }
  ],
  "externalScripts": [
    "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"
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
  "tags": ["tag1", "tag2"],
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
* **`externalScripts`**: An array of external scripts to be referenced on the page. Scripts referenced will be run before the layout script.

<span id="page-property-overriding">
<box type="warning">

Note: Page properties that are defined in `site.json` for a particular page will override those defined in the front matter of the page.
</box>
</span>

<span id="page-glob-overriding">
<box type="warning">

Note: If multiple **`src`** (pages) or **`glob`** (globs) attributes match a file, MarkBind will merge properties from all entries. If there are conflicting properties, pages are given priority over globs. If there are multiple matching glob entries, the last entry is given priority.

<div class="indented">

{{ icon_example }} Multiple entries matching `index.md`:

```js
{
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World",
      "searchable": "no"
    },
    {
      "glob": "*.md",
      "layout": "normal",
      "searchable": "yes"
    }
  ],
}
```

The following properties will apply to `index.md`:

```js
{
  "src": "index.md",
  "title": "Hello World",  // Inherited from page
  "layout": "normal",      // Inherited from glob
  "searchable": "no",      // Page takes priority over glob
}
```
</div>
</box>
</span>

#### **`externalScripts`**

**An array of external scripts to be referenced on all pages.** To reference an external script only on specific pages, `externalScripts` should be specified in `pages` instead. Scripts referenced will be run before the layout script.

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

#### **`tags`**

**A list of tags to filter page elements.**  Page elements with the specified tags are retained, while elements tagged with other tags are removed. Do not specify this option if you want to show everything. See [_User Guide: Tweaking the Page Structure → Using Tags_](tweakingThePageStructure.html#using-tags) section for more information.

#### **`headingIndexingLevel`**

**The level of headings to be indexed for searching.** Default: `3` %%i.e., only headings of levels 1,2,3 will be indexed for searching%%.

#### **`enableSearch`**

**Specifies that the website should use MarkBind's search functionality.** Default: `true`. See [User Guide: Making the Site Searchable]({{ baseUrl }}/userGuide/makingTheSiteSearchable.html) for more details.
