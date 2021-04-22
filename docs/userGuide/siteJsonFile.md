<frontmatter>
  title: "site.json File"
  layout: userGuide.md
  keywords: site.json
</frontmatter>

# `site.json` File

<span class="lead">

The `site.json` file {{ tooltip_root_directory }} is used to configure various aspects of a MarkBind website.
</span>

Here is a typical `site.json` file:

```json
{
  "baseUrl": "/myproduct",
  "faviconPath": "myfavicon.png",
  "titlePrefix": "FooBar Dev Docs",
  "style": {
    "bootstrapTheme": "bootswatch-cerulean",
    "codeTheme": "light"
  },
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World",
      "layout": "normal",
      "searchable": "no",
      "externalScripts": [
        "https://cdn.plot.ly/plotly-latest.min.js"
      ],
      "frontmatter": {
        "header": "header.md"
      }
    },
    {
      "glob": "topics/**/*.md",
      "globExclude": ["topics/*/appendix/*.md"],
      "layout": "subtopic"
    }
  ],
  "pagesExclude": ["subsite/**/*.md"],
  "externalScripts": [
    "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"
  ],
  "deploy": {
    "message": "Site Update.",
    "repo": "https://github.com/myorg/myrepo.git",
    "branch": "gh-pages"
  },
  "globalOverride": {
    "footer": "my-footer.md"
  },
  "ignore": [
    "_site/*",
    "*.json",
    "*.md",
    "*.mbd",
    ".git/*"
  ],
  "plugins" : [
    "filterTags"
  ],
  "pluginsContext" : {
    "filterTags" : {
      "tags": ["tag1", "tag2"]
    }
  },
  "headingIndexingLevel": 4,
  "intrasiteLinkValidation": {
    "enabled": false
  }
}
```

#### **`baseUrl`**

**The base url relative to your domain.** Default: `""`(empty).

<include src="deployingTheSite.md#warning-about-baseUrl" />

<box type="warning">

Note: `baseUrl` does not support [live preview](glossary.md#live-preview) as there is no use case for changing it in during `markbind serve`.
</box>

#### **`faviconPath`**

**The location of the favicon.** Default: `favicon.ico`.

<div class="indented">

%%{{ icon_info }} If the favicon was recently changed, you may need to force-refresh the Browser to see the new image.%%

</div>


#### **`titlePrefix`**

**The prefix for all page titles.** The separator <code>-</code> will be inserted by MarkBind.


#### **`style`**

_(Optional)_ **The styling options to be applied to the site.** This includes:
 
* **`bootstrapTheme`**
 _(Optional)_ **The theme for the generated site.** Uses the default Bootstrap theme if not specified. See [User Guide: Themes](themes.html) for more details.
 
* **`codeTheme`** [Optional. Default: `"dark"`]<br>
  The theme used for fenced code blocks. Accepts either `"light"` or `"dark"`.



#### **`pages`**

**An array of pages to be rendered.**

* **`src/glob`**
  * `src` can be used to specify a single file, or an array of files.<br>
  {{ icon_examples }} `docs/index.md` or `[ 'docs/index.md', 'docs/userGuide.md' ]` { .my-1 }
  * `glob` can be used alternatively to define a file pattern in the [_glob syntax_](https://en.wikipedia.org/wiki/Glob_(programming)), or an array of such file patterns.<br>
  {{ icon_examples }} `**/*.md` or `[ '**/*.md', '**/*.mbdf' ]` { .my-2 }
* **`globExclude`**: An array of file patterns to be excluded from rendering when using `glob`, also defined in the glob syntax.
* **`title`**: The page `<title>` for the generated web page. Titles specified here take priority over titles specified in the [front matter](addingPages.html#front-matter) of individual pages.
* **`layout`**: The [layout](tweakingThePageStructure.html#page-layouts) to be used by the page. Default: `default`.
* **`searchable`**: Specifies that the page(s) should be excluded from searching. Default: `yes`.
* **`externalScripts`**: An array of external scripts to be referenced on the page. Scripts referenced will be run before the layout script.
* **`frontMatter`**: Specifies properties to add to the front matter of a page or glob of pages. Overrides any existing properties if they have the same name, and overrides any front matter properties specified in `globalOverride`.

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

#### **`pagesExclude`**
**An array of file patterns to be excluded from rendering.** The exclusion pattern follows the glob syntax.

This property is the global variant to the `globExclude` property and is functionally identical to it. If the two are used at once, the file patterns from both properties will be combined when excluding pages.

#### **`externalScripts`**

**An array of external scripts to be referenced on all pages.** To reference an external script only on specific pages, `externalScripts` should be specified in `pages` instead. Scripts referenced will be run before the layout script.

#### **`globalOverride`**

**Globally overrides properties in the front matter of all pages.** Any property included in the global override will automatically be merged with the front matter of every single page, and override them if the property exists.

#### **`ignore`**

**An array of file patterns to be ignored when copying files to the generated site.** By default, MarkBind will copy all the files as assets of the generated site.

The ignore pattern follows the [glob pattern used in .gitignore](https://git-scm.com/docs/gitignore#_pattern_format). For example, `*.md` ignores all markdown source files.

<div id="site-json-deploy">

#### **`deploy`**

**The settings for [auto-deployment to Github pages](deployingTheSite.html).**

* **`message`** [Optional. Default: `"Site Update."`]<br>
  The commit message used for the deployment commit.

* **`repo`** [Optional. Default: the current working project's repo]<br>
  The repo you want to deploy to.<br>
  Format: `"https://github.com/<org|username>/<repo>.git"` (`"git@github.com:<org|username>/<repo>.git"` if you use SSH)<br>
  {{ icon_example }} `"https://github.com/myorg/myrepo.git"`

* **`branch`** [Optional. Default: `"gh-pages"`]<br>
  The branch that will be deployed to in the remote repo.
</div>

#### **`plugins`**,  **`pluginsContext`**

**A list of plugins to load.** Plugins are user-defined extensions that can add custom features to MarkBind. `pluginsContext` contains settings to be applied to the loaded plugins. See [User Guide: Using Plugins](usingPlugins.html) for more details.

The example above uses tags as an example of configuring plugin settings, refer to the [`filterTags` plugin](tweakingThePageStructure.html#filtertags-toggling-alternative-contents-in-a-page) for more details.

#### **`headingIndexingLevel`**

**The level of headings to be indexed for searching.** Default: `3` %%i.e., only headings of levels 1,2,3 will be indexed for searching%%.

#### **`enableSearch`**

**Specifies that the website should use MarkBind's search functionality.** Default: `true`. See [User Guide: Making the Site Searchable](makingTheSiteSearchable.html) for more details.

#### **`timeZone`**

**Time zone of the [time stamp](reusingContents.html#built-in-global-variables).** Default: `"UTC"`. 

<panel type="minimal" header="Time Zone Options">
  <include src="pages/timeZones.md" />
</panel>

<br>

#### **`locale`**

**Language by locale used for the [time stamp](reusingContents.html#built-in-global-variables).** Default: `"en-GB"` (`English (United Kingdom)`). <br>
The date format is thus - <br>
`<Day>, <Date> <Month> <Year>, <24-hour Time> <Time Zone Code>`. 

<panel type="minimal" header="Locale Options">
  <include src="pages/locales.md" />
</panel>
<br>

#### **`intrasiteLinkValidation`**

**Toggle whether to validate intra-site links.** By default, MarkBind will validate all intra-site links and alert you of any potentially invalid ones. 
To disable this validation **entirely**, you may add the following to `site.json`:
<div id="disable-global-intrasite-link-validation">

  ```js
  ...
  "intrasiteLinkValidation": {
    "enabled": false
  },
  ...
  ```
</div>
