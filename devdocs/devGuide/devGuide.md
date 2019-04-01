<frontmatter>
  title: "Developer Guide"
  header: header.md
  footer: footer.md
  pageNav: default
  siteNav: devGuideSections.md
</frontmatter>

## Requirement

We expect contributors for MarkBind to have basic knowledge of the following:

* JavaScript (ES6)
* Node.js (LTS or higher) [with npm version of 5.8.0]
* HTML & CSS
* Markdown
* Command-line environment

## Environment

The MarkBind project should be developed with Node.js version 8.0 or higher.

We recommend you to use WebStorm for a better development experience.

Use JavaScript ES6 features if possible for better performance, e.g. Promise instead of callback.

## Project Structure

MarkBind project consists of two repos:

* [MarkBind](https://github.com/MarkBind/markbind)

  * The command-line interface (CLI) application that accepts commands from users, and uses the core library to parse and generate web pages resides in the root.

  * The core library that resolves the content include path, and the rendering of Markdown contents resides in the `lib/markbind/` directory.

  Stack used: *Node.js*

* [VueStrap library (forked version modified for MarkBind)](https://github.com/MarkBind/vue-strap)

  * The UI components library used in MarkBind project. Users could use it in their contents to create complex and interactive structure.

  Stack used: *Vue.js*

### MarkBind Core Library

The core library parses the given Markdown file, processes all the content include, and renders all Markdown into HTML so that it could be displayed in a browser.

All the core logic resides inside the `lib/parser.js` file. It exposes two important APIs: **include** and **render**.

*Include* and *Render* will first parse the given file as a DOM tree, and then recursively visit every node to check if it needs special handling.

In the *Include* stage, it will check if the node will include new contents (for example, if it is an "include" tag (`<include />`), and then load the file/content to be included into the current working context. For the new content included, the *Include* step will be run recursively until all the content to be included are resolved and loaded.

*Render* is a similar process to *Include*, but it will render the content recursively to ensure all Markdown are converted to HTML.

MarkBind uses [markdown-it](https://github.com/markdown-it/markdown-it) to do the Markdown parsing and rendering. There are also several customized markdown-it plugins used in MarkBind, which are located inside the `lib/markdown-it/` directory.

### MarkBind CLI

The CLI application handles the site generation logic. It contains the command handling logic, as well as the Site and Page models.

The site generation logic is as follows:

1. Read the project's `site.json` file to collect all pages that will be generated.
2. Create a Site model, where the site's root path is where `site.json` is located. The site model knows all the pages it contains, as well as the static assets. Static assets, such as stylesheets and JavaScript libraries, will be scanned and filtered, and then copied to the generated site folder (`_site/`).
3. The Site model will create different Page models, and each Page model will generate a HTML page at the designated file location by calling MarkBind core library's *include* and *render* APIs.

The generated page is rendered using [EJS](https://github.com/mde/ejs) and [nunjucks](https://mozilla.github.io/nunjucks/), and the page template could be found at `lib/template/page.ejs`.

Static assets of MarkBind, such as stylesheets and JavaScript libraries, are located in `asset/` folder. They will be copied to the generated site and used in the generated pages. For each version update of VueStrap, copy the built library file to overwrite `asset/js/vue-strap.min.js`.

The CLI program is built using [commander.js](https://github.com/tj/commander.js/).

The auto deployment library used is [gh-pages](https://github.com/tschaub/gh-pages).

### VueStrap

The VueStrap library is [Bootstrap](getbootstrap.com/components/) components rewritten in [Vue.js](vuejs.org). We forked it from the original repo, and changed it based on our needs for educational websites.

You can find more information at the [VueStrap repo](https://github.com/MarkBind/vue-strap).

## Development Process

### Development

1. Fork and clone the MarkBind repo.

2. In the folder of your cloned repo, run

	```
	$ npm install
	```

  to install the project dependencies.

3. To make sure you are using the cloned CLI program in your own terminal/console, in the cloned CLI repo, run

	```
	$ npm link
	```

  to bind the local MarkBind CLI program to the cloned development version.

4. Now you can start making changes.

#### Troubleshooting

**Q: When I build a MarkBind website, I get strange errors relating to HTML tags in .md/.mbd files. For example:**

```
TypeError: Cannot set property 'src' of null
    at Page.collectFrontMatter (~\markbind\src\Page.js:399:26)
```

A: If your npm version is v6.0.0 or higher, there is a change in behaviour on how npm install dependencies (see https://github.com/MarkBind/markbind/issues/582). To resolve this issue, discard the changes made by npm in `package-lock.json`, and redo `npm install`.

### Testing

Our test script does the following:

1. Lints the code for any code and style errors using ESLint.
1. Builds the test site found in `test/test_site/`.
1. Compares the HTML files generated with the HTML files in `test/test_site/expected/`.

#### Running tests

To execute the tests, simply run:

For Unix:

```
$ npm run test
```

For Windows users:

```
$ npm run testwin
```

#### Updating tests

When adding new features, updating existing features or fixing bugs, you should update the expected site to reflect the changes.

##### Changes to existing features

Simply update the expected HTML files in `test/test_site/expected/` to reflect the changes.

##### New features

Add new site content into the `test/test_site/` folder to demonstrate the new feature. Ensure that the new content is included in the test site so that your feature will be tested when `markbind build` is run on the test site. Remember to update the expected HTML files in `test/test_site/expected/`.

### Using ESLint

Our projects follow a [coding standard](https://github.com/oss-generic/process/blob/master/docs/CodingStandards.adoc). Using a linter will help check and fix some of the code style errors in your code. It will save time for both you and your code reviewer. The linting tool we use is [ESLint](https://eslint.org/). Here is a [gist](https://gist.github.com/nicholaschuayunzhi/bfe53dbb5f1a0f02d545d55956f9ab7e) with an explanation of the ESLint rules chosen in markbind-cli.

#### Installation

Install developer dependencies (ESLint, related plugins) in your cloned markbind and markbind-cli repositories.

```
$ npm install --only=dev
```

#### Lint your code

Before making a commit or pull request, you should lint your code.

To lint a specific file, go to the root directory of the cloned repo and run

```
$ ./node_modules/.bin/eslint path/to/specificfile.js
```

To lint all files, run

```
$ ./node_modules/.bin/eslint .
```

You can add the `--fix` flag to correct any fixable style errors.

```
$ ./node_modules/.bin/eslint . --fix
```

#### Integration with editors

ESLint has [integrations with popular editors](https://eslint.org/docs/user-guide/integrations). They offer features such as "fix errors on save", which will make developement more convenient.
