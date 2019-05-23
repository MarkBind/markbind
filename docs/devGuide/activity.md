<frontmatter>
  title: "Developer Guide"
  header: header.md
  footer: footer.md
  pageNav: default
  siteNav: devGuideSections.md
</frontmatter>

# Reference
(will be migrated here later)
- [Page.js](https://drive.google.com/open?id=1DZEgh8upg4Sgg3RB9zTCMRdAXTSslqioWhOG0xe1Y44)
- [Site.js](https://drive.google.com/open?id=1VVvqBSTUPfFROuQB1A687eayTzYWuxrL6A72yfF-VzU)


# Frontmatter

- attr1: desc


# Serve

Firstly, the temp and output folders are emptied. Then the site config file is read (site.json by default).
The tool then parses the pages defined in the site config file, by finding files that match the globals and combining them with pages
defined by src, this list contains all addressable pages of the site.

Next, the tool traverses through the directory and records each subdirectory that contains a site config file. Usually there will only be one
such directory, where the command is executed. The path to this directory is known as `baseUrl`, and is used to build absolute paths from 
relative paths.

The tool reads `_markbind/variables.md` to store the list of user defined variables (UDV). The variables themselves can contain references to other
user defined variables, which are resolved here using Nunjucks. This list of UDV is also used to contain references to font-awesome icons, which are used internally. A separate variables map can exist for each subsite, storing subsite specific global variables.

Plugins are then read from `src/plugins`. Default plugins (plugins shipped with MarkBind) are loaded with a pluginsContext object, which allows
users to define settings for these plugins. Non-default plugins (plugins supplied by the user) are then loaded, but without a pluginsContext object.

The heavy lifting happens next, in the `buildSourceFiles()` method, which calls `site.generatePages()`. For each addressable page collected in the step described above, a new `Page` object is created, and `Page.generate()` is called (explained in greater detail below). After all pages are generated, temporary objects created during page generation are cleaned up.

MarkBind, FontAwesome assets are then copied to the output directory, along with layout files. The tool then writes meta data for the site to the `siteData.json` file.

The tool then attaches a file system watcher and event listeners to facilitate the live reload functionality. Finally, the tool starts a local server to preview the page.

1. `$ markbind serve`
   1. `new Site()`
   1. `site.generate()`
      1. Empty temp and output folders
      1. Read site config from siteConfig file (site.json by default)
      1. Collect addressable pages
         1. Read globals and pages defined in siteConfig
         1. Find files that match globals
         1. Compile list of addressable pages from defined pages and global-matched pages
      1. Collect baseUrl
         1. Traverse through directory
         1. Record directories that contain a siteConfig file in baseUrlMap
      1. Collect user defined variables (UDV)
         1. Add icons and MarkBind variables to UDV
         1. For each subsite
            1. Read variables.md
            1. Renders variables using Nunjucks
            1. Adds an entry for that subsite in UDV
      1. Collect plugins
         1. Find default plugins
         1. Loads non-default plugins
         1. Loads default plugins with pluginsContext
      1. Build source files
         1. `site.generatePages()`
            1. For each addressable page
               1. `site.createPage()`
                  1. `new Page()`
               1. [`page.generate()`](#page-generate)
         1. Remove temp pages
      1. Copy MarkBind, FontAwesome assets to output directory
      1. Copy layouts
      1. Update siteData
   1. Attach FS watchers and event handlers
   1. Start server

# `Page.generate()`

This method generates a HTML page from a .mbd/.md file. It uses Nunjucks for variables processing, Cheerio for HTML DOM manipulation, HTMLParser2 for basic HTML node parsing and processing, and a specially built Parser for handling dynamic content.

First, a call to `Parser.includeFile` designates that the current file is to be included in the site. The source file is read, page specific variables are extracted, and all variables are replaced by their stored values using Nunjucks. Each HTML node is then pre-processed using HTMLParser2, to detect and handle missing/invalid src references, register `<include>` tags, removing `<variable>` tags, and applying `boilerplate`, `optional`, `inline`, `dynamic`, `trim` attributes. `<include>` tags are changed to `<div>`, `<span>`, or `<panel>` tags, depending on its attributes, and with the exception of `dynamic` `<include>` tags, the file referenced in src is read and inserted into the current page.

Front matter is read and removed from the page next. `<header>` and `<footer>` tags and their content are removed as well, since the site adds its own as specified in front matter. The entire page is wrapped in a wrapper `<div>`.

At this point, the page is a pre-processed mix of Markdown, HTML and Nunjucks with included content inserted. 

==Plugins pre-render== methods are run here.

After, the site navigation menu is inserted. Temporary styles to mitigate FOUC are inserted as well.
The header and footer files as specified in front matter are loaded and inserted into the page.
The file is then written to a temp folder.

`Parser.renderFile` renders Markdown tags and resolves the src attribute of dynamic panels.

==Plugins post-render== methods are run here.

The assets added by plugins (e.g. scripts, stylesheets) are collected and stored (but not added to the page yet).






1. [`Parser`] `parser.includeFile`
   1. Check if file is a boilerplate file
      1. If it is, set the path to the boilerplate file
   1. Read file
   1. Extract page variables
   1. Replace variables using Nunjucks
   1. Pre-process each node and its child nodes
      1. Checks and handles missing/invalid src references
      1. Registers includes
      1. Special handling of `<include>` and `<panel>` tags
      1. Removes `<variable>` tags
      1. Processes the `boilerplate`, `optional`, `inline`, `dynamic`, `trim` attributes
1. [`Cheerio`] Collect and remove frontmatter
1. [`Cheerio`] Remove page header and footer
1. [`Cheerio`] Add content wrapper
1. [`Plugin`] Pre-render 
   - Plugins' pre-render entry point
1. [`Cheerio`] Insert site navigation menu
1. [`Cheerio`] Insert temp styles
1. [`Nunjucks`] Insert header file
   - Load header file as defined in frontmatter, process variables with Nunjucks
1. [`Nunjucks`] Insert footer file
   - Load footer file as defined in frontmatter, process variables with Nunjucks
1. [`Parser`] Resolve baseUrl
1. [`File`] Write to temp file
1. **[`Parser/Markdown`] `Parser.renderFile` - Main render function**
   1. `HTMLParser2.parse()`
   1. `Parser._parse()`
      - Renders `<md>` and `<markdown>` to `<span>` and `<div>`
	  - Resolves dynamic `<panel>` src
   1. Trims nodes
1. [`Plugin`] Post-render
   - Plugins' post-render entry point
1. [`Page`] Collect page content added by plugins
1. [`Cheerio`] Process dynamic resources
   - Converts `src` and `href` attributes to absolute paths where appropriate
1. [`Page`] Unwrap include src
1. [`Beautify`] HTML beautify
1. [`Page`] Add layout files
1. [`Page`] Collect head files
1. [`Nunjucks`] Nunjucks render
1. [`Page`] Collect all page sections
1. [`Page`] Build page navigation menu
1. [`Beautify`] HTML beautify
1. [`EJS`] Apply EJS template
1. [`Page`] Write to result folder
1. [`Page`] Wait for included src files to be resolved
1. [`Page`] Collect included files
   1. Dynamic
   1. Static
   1. Boilerplate
   1. Missing
