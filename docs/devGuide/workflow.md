<variable name="title">Workflow</variable>
<frontmatter>
  title: "{{ title }}"
  layout: devGuide
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

Our workflow is mostly based on the guidelines given at se-education.org/guides. This page points to the relevant parts of those guides and provide additional details specific to MarkBind.
</div>

**To submit a PR**, follow [this guide](https://se-education.org/guides/guidelines/PRs.html), but note the following:

* You can start by looking through [these issues](https://github.com/MarkBind/markbind/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+sort%3Acomments-desc) marked <span href="" class="badge" style="color:white; background-color: #7057FF;">good first issue</span>. Don't do more than one of them though.
* As we squash the commits when merging a PR, there is ==no need to follow a strict commit organization or write elaborate commit messages for each commit==.
* You can refer to the [_Design_](design.html) page to learn about the design and implementation of MarkBind.

The sections below has more information about various stages of submitting a PR.

## Writing code

Use JavaScript ES6 features if possible for better performance, e.g. Promise instead of callback.

Do note [our style guides](styleGuides.html).

## Testing

Our test script does the following:

1. Lints the code for any code and style errors using ESLint.
1. Runs unit tests for the main and sub packages.
1. Builds the test sites whose directory names are listed in `test/functional/test_site`.
1. For each test site, compares the HTML files generated with the HTML files in its `expected` directory.

#### Running tests

To execute all the tests, simply run:

* Unix: `npm run test`
* Windows: `npm run testwin`


#### Updating and writing tests

Whether you are adding a new feature, updating existing features or fixing bugs, make sure to update the test files (test sites, snapshots) to reflect the changes by running the appropriate script:

* Unix: `npm run updatetest`
* Windows: `npm run updatetestwin`

<box type="warning" seamless>
  You should always check that the generated output is correct before committing any changes to the test sites.
</box>

##### Adding test site content

When adding new features, you should also add new site content into an existing test site or create a new test site to demonstrate the new feature. This is to ensure that your feature can be tested by building that test site.

To add a page to an existing test site, for this example, to `test_site`:

1. Add a new test page, e.g., `newTestPage.md`, containing a demonstration of the new feature.

1. Open the `site.json` corresponding to the test site, i.e. `test/functional/test_site/site.json`

1. To include the new page, i.e. `newTestPage.md`, add it to the `pages` array.

   ``` {heading="site.json" highlight-lines="16,17"}
   "pages": [
     {
       "src": "index.md",
       "title": "Hello World",
       "frontmatter": {
         "frontMatterOverrideProperty": "Overridden by front matter override",
         "globalAndFrontMatterOverrideProperty":  "Overridden by front matter override"
       }
     },
     ...
     {
       "src": "testLayouts.md",
       "title": "Hello World"
     },
     {,
       "src": "newTestPage.md",
       "title": [some title you see fit]
     },
     ...
   ```

1. Update the tests using `npm run updatetest`.

<box type="info">

  When creating a new test site, the directory name of the new test site should be added to `test/functional/test_sites` file.
</box>

##### Adding snapshot tests for components

When making changes to the Vue components in `packages/vue-components`, you should add new snapshot tests or adapt existing ones as appropriate.

Once you're done, be sure to run the `updatetest` script mentioned [above](#updating-and-writing-tests)!


## Linting

We follow [our style guides](styleGuides.html). Using a linter will help check and fix some of the code style errors in your code. It will save time for both you and your code reviewer. The linting tool we use is [ESLint](https://eslint.org/). Here is a [gist](https://gist.github.com/nicholaschuayunzhi/bfe53dbb5f1a0f02d545d55956f9ab7e) with an explanation of the ESLint rules chosen in markbind-cli.

Before making a commit or pull request, you should lint your code by running the following commands from the root of your project:

* To lint a specific file: `eslint path/to/specificfile.js`
* To lint all files: `npm run lint`

It is also possible to auto-fix some (not all) style errors:
* To correct any fixable style errors, run `npm run lintfix`
* To correct fixable style errors for both JavaScript and CSS, run `npm run autolint`

<box type="tip" seamless>

ESLint has [integrations with popular editors](https://eslint.org/docs/user-guide/integrations). They offer features such as "fix errors on save", which will make development smoother.
</box>

<box type="tip" seamless>

There are several versions of the _test and linting scripts_ in the main `package.json` that execute for only one of the main or sub packages,
feel free to look into `package.json` and use them as you see fit!
</box>

## Updating dependencies

We use `npm install <package folder>` to <tooltip content="take a look under the command in the link!">[hoist](https://docs.npmjs.com/cli/install)</tooltip> the MarkBind core package's dependencies to the root `node_modules`, avoiding dependency duplication between the `markbind-cli` and `markbind` packages where possible.

Hence, when updating dependencies of the `markbind` core package, be sure to run the `npm install packages/core` command, or simply the `npm run install:core` script. If you upgraded the dependencies of multiple packages, simply run `npm run install:all` instead.

If the dependency <tooltip content="i.e. is also listed under the root `package.json`">is also used</tooltip> in the root package, make sure to update its <tooltip content="as listed in the `package.json` file">version number</tooltip> as well!

<box type="warning">

Conversely, when updating dependencies of the *root* package, be sure to still check whether any subpackages list this as a dependency!
If so, follow the above process as well.
</box>
