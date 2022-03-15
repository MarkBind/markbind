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

* Functions and libraries used to parse and process MarkBind into usable output are stored in `src`. The architecture described in [Architecture](../design/architecture) is contained here. A brief rundown of what it includes:

    * Various key functionalities in processing MarkBind syntax into valid html output, stored in `html`. The other part of the content processing flow is found in `variables`, which manages site variables and facillitates the Nunjucks calls.

    * `Page` files generate a single page of the site, and are managed by the `Site` instance. `Site` uses the Page model's interface to generate pages, and performs various other utility-like functions related to site generation such as copying of external assets into the output folder.

    * `Layout` holds the files relating to the layout of the site and are managed by `LayoutManager`. Similarly, `External` files, which are separate output files to be loaded dynamically and on-demand, are managed by a `ExternalManager` instance.

    * Various libraries (contained in `lib`) and plugins (in `plugins`) are also stored here. Some external libraries have also been amended to suit MarkBind's purpose – see `patches`.

* MarkBind's [templates](https://markbind.org/userGuide/templates.html), used in the `markbind init` command.

* Unit Tests (though there are more unit tests and functional tests in the cli library)

**The key external libraries used are:**

* [markdown-it](https://github.com/markdown-it/markdown-it), which does the Markdown parsing and rendering. There are also several customized markdown-it plugins used in MarkBind, which are located inside the `src/lib/markdown-it/` directory.

  * Serveral markdown-it plugins are installed to enhance the existing Markdown syntax. They can be found in `src/package.json`. Some of them are patched in the `src/lib/markdown-it/patches/` directory to fit MarkBind's needs. 

  * Additionally, there are some markdown-it plugins in the `src/lib/markdown-it/plugins/` directory (either forked, modified or written to enhance existing functionalities).

* [htmlparser2](https://github.com/fb55/htmlparser2), a speedy and forgiving html parser which exposes a dom-like object structure to work on. To comply with the markdown spec, and our custom requirements, `src/patches/htmlparser2.js` patches various behaviours of this library.

* [cheerio](https://cheerio.js.org/), which is a node.js equivalent of [jQuery](https://jquery.com/). Cheerio uses [htmlparser2](https://github.com/fb55/htmlparser2) to parse the html as well, hence our patches propagate here.

* [Nunjucks](https://mozilla.github.io/nunjucks/), which is a JavaScript templating engine. Nunjucks is used to support our variable system to help with reusing small bits of code in multiple places. The package is patched and stored in `src/patches/nunjucks` to make it compatible with other MarkBind syntax processing steps.

### MarkBind CLI

The CLI application uses and further builds on the interface exposed by the core library's `Site` model to provide functionalities for the author, such as `markbind serve` which initiates a live reload workflow.

**The key external libraries used are:**
* [commander.js](https://github.com/tj/commander.js/), which is a node.js CLI framework.

* [live-server](https://github.com/tapio/live-server), which is a simple web server for local development and preview of a MarkBind site. The package is patched and stored in `src/lib/live-server` with our custom fine tuning.

### MarkBind core-web library

This package houses the various frontend assets used in the core package.

Some external assets included are Vue.js, jQuery, bootstrap bundles, and fontawesome bundles.

Internal bundles are also present, generated from setup scripts, custom stylesheets and the UI components library.

### UI components library

This package consists of a mix of [Bootstrap](https://getbootstrap.com/components/) and proprietary components rewritten in [Vue.js](https://vuejs.org) based on our needs for educational websites.

We forked it from the original [yuche/vue-strap](https://github.com/yuche/vue-strap) repo into the [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap) repo, and then later merged it into the main [MarkBind/markbind](https://github.com/MarkBind/markbind) repo.
