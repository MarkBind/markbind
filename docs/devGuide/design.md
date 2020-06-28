<variable name="title">Design</variable>
<frontmatter>
  title: "{{ title }}"
  layout: devGuide
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

This page gives you an overview of the MarkBind's internal design.
</div>

## Project structure

The MarkBind project is developed in a monorepo ([MarkBind/markbind](https://github.com/MarkBind/markbind)) of 3 packages:

* The command-line interface (CLI) application, which accepts commands from users and then uses the core library to parse and generate web pages, resides in the root.

* The core library, which resolves the content include path and renders Markdown content, resides in the `packages/core/` directory.

* The UI components library, which MarkBind authors can use to create content with complex and interactive structure, resides in the `packages/vue-components/` directory.

  Stack used: *Node.js*, *Vue.js*

### MarkBind core library

The core library parses the given Markdown file, processes all the content include, and renders all Markdown into HTML so that it could be displayed in a browser.

All the core logic resides inside the `src/Parser.js` file. It exposes two important APIs: **include** and **render**.

*Include* and *Render* will first parse the given file as a DOM tree, and then recursively visit every node to check if it needs special handling.

In the *Include* stage, it will check if the node will include new contents (for example, if it is an "include" tag (`<include />`), and then load the file/content to be included into the current working context. For the new content included, the *Include* step will be run recursively until all the content to be included are resolved and loaded.

*Render* is a similar process to *Include*, but it will render the content recursively to ensure all Markdown are converted to HTML.

MarkBind uses [markdown-it](https://github.com/markdown-it/markdown-it) to do the Markdown parsing and rendering. There are also several customized markdown-it plugins used in MarkBind, which are located inside the `src/lib/markdown-it/` directory.

### MarkBind CLI

The CLI application handles the site generation logic. It contains the command handling logic, as well as the Site and Page models.

The site generation logic is as follows:

1. Read the project's `site.json` file to collect all pages that will be generated.
2. Create a Site model, where the site's root path is where `site.json` is located. The site model knows all the pages it contains, as well as the static assets. Static assets, such as stylesheets and JavaScript libraries, will be scanned and filtered, and then copied to the generated site folder (`_site/`).
3. The Site model will create different Page models, and each Page model will generate a HTML page at the designated file location by calling MarkBind core library's *include* and *render* APIs.

The generated page is rendered using [nunjucks](https://mozilla.github.io/nunjucks/), and the page template could be found at `lib/template/page.njk`.

Static assets of MarkBind, such as stylesheets and JavaScript libraries, are located in `asset/` folder. They will be copied to the generated site and used in the generated pages.

The CLI program is built using [commander.js](https://github.com/tj/commander.js/).

The auto deployment library used is [gh-pages](https://github.com/tschaub/gh-pages).

### UI components library

This package consists of a mix of [Bootstrap](getbootstrap.com/components/) and proprietary components rewritten in [Vue.js](vuejs.org) based on our needs for educational websites.

We forked it from the original [yuche/vue-strap](https://github.com/yuche/vue-strap) repo into the [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap) repo, and then later merged it into the main [MarkBind/markbind](https://github.com/MarkBind/markbind) repo.
