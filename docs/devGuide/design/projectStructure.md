{% set title = "Project Structure" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

This page gives you an overview of the MarkBind's internal project structure.
</div>

## Packages

The MarkBind project is developed in a <tooltip content="We follow a monorepo approach, similar to Babel and other open source projects. To see a discussion on the pros and cons of this approach, read [here](https://github.com/babel/babel/blob/main/doc/design/monorepo.md).">monorepo</tooltip> ([MarkBind/markbind](https://github.com/MarkBind/markbind)) of 4 packages:

* The core library, which parses and processes MarkBind's various syntaxes, resides in the `packages/core/` directory.

* The command-line interface (CLI) application, which accepts commands from users and then uses the core library to parse and generate web pages, resides in the `packages/cli/` directory.

* The core web library, which contains a generated web bundle from various setup scripts and the UI components library, resides in `packages/core-web/`.

* The UI components library, which MarkBind authors can use to create content with complex and interactive structure, resides in the `packages/vue-components/` directory.

  Stack used: *Node.js*, *Vue.js*

### MarkBind core library

**The core library mainly houses:**

* Functions and libraries used to parse and process MarkBind into usable output are stored in `src`. The architecture described in [Architecture](architecture.md) is contained here. A brief rundown of what it includes:

  * Various key functionalities in processing MarkBind syntax into valid HTML output, stored in `html`. The other part of the content processing flow is found in `variables`, which manages site variables and facilitates the Nunjucks calls.

  * `Page` files generate a single page of the site, and are managed by the `Site` instance. `Site` uses the Page model's interface to generate pages, and performs various other utility-like functions related to site generation such as copying of external assets into the output folder.

  * `Layout` holds the files relating to the layout of the site and are managed by `LayoutManager`. Similarly, `External` files, which are separate output files to be loaded dynamically and on-demand, are managed by a `ExternalManager` instance.

  * Various libraries (contained in `lib`) and plugins (in `plugins`) are also stored here. Some external libraries have also been amended to suit MarkBind's purpose – see `patches`.

* MarkBind's <a tags="environment--combined" href="/userGuide/templates.html">templates</a><a tags="environment--dg" href="https://markbind.org/userGuide/templates.html">templates</a>, used in the `markbind init` command.

* Unit Tests (though there are more unit tests and functional tests in the cli library)

**The key external libraries used are:**

* [markdown-it](https://github.com/markdown-it/markdown-it), which does the Markdown parsing and rendering. There are also several customized markdown-it plugins used in MarkBind, which are located inside the `src/lib/markdown-it/` directory.

  * Several markdown-it plugins are installed to enhance the existing Markdown syntax. They can be found in `src/package.json`. Some of them are patched in the `src/lib/markdown-it/patches/` directory to fit MarkBind's needs. 

  * Additionally, there are some markdown-it plugins in the `src/lib/markdown-it/plugins/` directory (either forked, modified or written to enhance existing functionalities).

* [htmlparser2](https://github.com/fb55/htmlparser2), a speedy and forgiving HTML parser which exposes a DOM-like object structure to work on. To comply with the markdown spec, and our custom requirements, `src/patches/htmlparser2.js` patches various behaviours of this library.

* [cheerio](https://cheerio.js.org/), which is a node.js equivalent of [jQuery](https://jquery.com/). Cheerio uses [htmlparser2](https://github.com/fb55/htmlparser2) to parse the HTML as well, hence our patches propagate here.

* [Nunjucks](https://mozilla.github.io/nunjucks/), which is a JavaScript templating engine. Nunjucks is used to support our variable system to help with reusing small bits of code in multiple places. The package is patched and stored in `src/patches/nunjucks` to make it compatible with other MarkBind syntax processing steps.

### MarkBind CLI

The CLI application uses and further builds on the interface exposed by the core library's `Site` model to provide functionalities for the author, such as `markbind serve` which initiates a live reload workflow.

**The key external libraries used are:**

* [commander.js](https://github.com/tj/commander.js/), which is a node.js CLI framework.

* [live-server](https://github.com/tapio/live-server), which is a simple web server for local development and preview of a MarkBind site. The package is patched and stored in `src/lib/live-server` with our custom fine tuning.

### MarkBind core-web library

This package houses the various frontend assets used in the core package. It bundles all the essential client-side assets and UI logic needed for rendering and enhancing the generated static sites. It also builds a Node-compatible bundle of Vue components and app setup logic which is used by MarkBind's server-side renderer to pre-render pages during the build process.

**External Assets include:**
* Vue.js runtime (client side)
* Bootstrap and FontAwesome bundles

**Internal Assets include:**
* Custom stylesheets and component styles
* Client-side setup scripts (`src/index.js`)
* Render logic bootstrapped from MarkBind's Vue server renderer
* Core UI component library used in templates and sites

The `core-web` library is bundled via [Webpack](https://webpack.js.org/) using specific configurations. The final output of this package includes:
* `markbind.min.js` — The main client-side JS bundle
* `markbind.min.css` — Minified CSS styles
* `vueCommonAppFactory.min.js` — Server-compatible bundle that sets up the Vue app for SSR rendering.
* Supporting fonts and static assets

The client-side bundles and assets are referenced in every generated MarkBind page to enable dynamic enhancements and consistent styling.

### UI components library

This package consists of a mix of [Bootstrap](https://getbootstrap.com/components/) and proprietary components rewritten in [Vue.js](https://vuejs.org) based on our needs for educational websites.

We forked it from the original [yuche/vue-strap](https://github.com/yuche/vue-strap) repo into the [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap) repo, and then later merged it into the main [MarkBind/markbind](https://github.com/MarkBind/markbind) repo.

**The key dependencies used are:**

* [Vue.js](http://vuejs.org/) (required ^v2.x.x, test with v2.6.14).

* [Bootstrap CSS](http://getbootstrap.com/) (required 5.x.x, test with 5.1.3). MarkBind's Vue components doesn't depend on a very precise version of Bootstrap.

Some custom components and directives are also added for MarkBind's use.

***

* **MarkBind components newly created or revamped since moving**

  * Modal.vue (built on [Vue Final Modal](https://vue-final-modal.org/))

  * Question.vue

  * QOption.vue

  * Quiz.vue

  * Popover.vue (built on floating-vue's [Menu](https://floating-vue.starpad.dev/guide/component.html#hover-menu) component)

  * Tooltip.vue (built on floating-vue's [Tooltip](https://floating-vue.starpad.dev/guide/component.html#tooltip) component)

  * Trigger.vue (built on vue-final-modal's [$vfm API](https://vue-final-modal.org/api#api) and Floating Vue's Menus and Tooltips)

* **MarkBind components ported from [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap)**

  * Pic.vue

  * Retriever.vue

  * Searchbar.vue

  * SearchbarPageItem.vue

  * Thumbnail.vue

  * Box.vue

* **Custom directives ported from [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap)**

  * Closeable.js

  * Float.js

* **VueStrap components modified for use in MarkBind**

  * Dropdown.vue

  * Navbar.vue

  * NestedPanel.vue

  * MinimalPanel.vue

  * Tab.vue

  * TabGroup.vue

  * Tabset.vue

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../development/migratingToTypeScript', 'architecture') }}