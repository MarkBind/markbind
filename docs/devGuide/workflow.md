{% set title = "Workflow" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
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

#### General tips

* Use JavaScript ES6 features if possible for better performance, e.g. Promise instead of callback.
* Do note [our style guides](styleGuides.html).
* Do set up your IDE debugger! We provide several sample configurations for <trigger trigger="click" for="webstorm-debug">WebStorm</trigger> and <trigger trigger="click" for="vs-code-debug">VS Code</trigger>.

  <modal header="Debugging Configurations - WebStorm" id="webstorm-debug" large>
  
  Refer [here](https://blog.jetbrains.com/webstorm/2018/01/how-to-debug-with-webstorm/) for a quick guide on adding debugging and running configuration in WebStorm, and how to run them.
  
  Once done, see these screenshots for sample debugging configurations, and tweak them further to suit your needs.
  
  **1. Using the docs as a development environment**, with:
    - the [lazy reload `-o`](https://markbind.org/userGuide/cliCommands.html#serve-command) option to speed up page building
    - the `-d` developer option. (see [below](#editing-frontend-features))
    
    {.mb-3}  
  
    ![]({{baseUrl}}/images/debugger/WebStorm_1.png) {.ml-4}
  
  **2. Debugging all tests** in the `npm run test` script:
  
    ![]({{baseUrl}}/images/debugger/WebStorm_2.png) {.ml-4}
    
  **3. Debugging only the cli package's tests**:
    
    ![]({{baseUrl}}/images/debugger/WebStorm_3.png) {.ml-4}
  
  </modal>

  <modal header="Debugging Configurations - VS Code" id="vs-code-debug" large>
  
  Refer [here](https://code.visualstudio.com/docs/editor/debugging) for a general guide on adding and running debugging configurations in VS Code.
  
  In your `.vscode/launch.json` file, you may use these sample configurations as a baseline, and tweak them as you see fit.
  
  **1. Using the docs as a development environment**, with:
    - the [lazy reload `-o`](https://markbind.org/userGuide/cliCommands.html#serve-command) option to speed up page building
    - the `-d` developer option. (see [below](#editing-frontend-features))
      
    {.mb-3}  
    
    ```json {.ml-4 .no-line-numbers heading="launch.json"}
    {
        "configurations": [
            {
                "type": "node",
                "request": "launch",
                "name": "Dev Docs",
                "skipFiles": [
                    "<node_internals>/**"
                ],
                "cwd": "${workspaceFolder}/docs",
                "program": "${workspaceFolder}/packages/cli/index.js",
                "args": ["serve", "-o", "-d"]
            }
        ]
    }
    ```
  
  **2. Debugging all tests** in the `npm run test` script:
  
    ```json {.ml-4 .no-line-numbers heading="launch.json"}
    {
        "configurations": [
            {
                "type": "node",
                "request": "launch",
                "name": "test",
                "skipFiles": [
                    "<node_internals>/**"
                ],
                "cwd": "${workspaceFolder}",
                "runtimeExecutable": "npm",
                "runtimeArgs": ["run", "test"]
            }
        ]
    }
    ```
  
  **3. Debugging only the cli package's tests**:
    
    ```json {.ml-4 .no-line-numbers heading="launch.json"}
    {
        "configurations": [
            {
                "type": "node",
                "request": "launch",
                "name": "test cli",
                "skipFiles": [
                    "<node_internals>/**"
                ],
                "cwd": "${workspaceFolder}/packages/cli",
                "runtimeExecutable": "npm",
                "runtimeArgs": ["run", "test"]
            }
        ]
    }
    ```
    
  </modal>

#### Editing frontend features

We update the frontend `markbind.min.js` and `markbind.min.css` bundles during release only, and not in pull requests.

Hence, if you need to view the latest frontend changes (relating to `packages/core-web` or `packages/vue-components`), you can either:
1. Run `npm run build:web` in the root directory, which builds the above bundles,
   then run your markbind-cli [command](https://markbind.org/userGuide/cliCommands.html) of choice.
2. Run `markbind serve -d` (with any other applicable options). (**recommended**)<br>
   This adds the necessary webpack middlewares to the development server to compile the above bundles,
   and enables live and hot reloading for frontend source files. 

## Testing

Our test script does the following:

1. Lints the code (`.js`, `.vue`) and stylesheets (`.css`) for any style errors using [ESLint](https://eslint.org/) and [StyleLint](https://stylelint.io/).
1. Runs unit tests for all packages with [Jest](https://jestjs.io/).
1. Builds the test sites whose directory names are listed in `packages/cli/test/functional/testSites.js`.
1. For each test site, compares the HTML files generated with the HTML files in its `expected` directory.

To run the test script, use: `npm run test`

<box type="tip" seamless>

If you only want to run tests for one of the packages (`packages/*`), simply switch into the appropriate directory and use `npm run test` as well!
</box>

#### Updating and writing tests

Whether you are adding a new feature, updating existing features or fixing bugs, make sure to update the **source** test files (test sites, snapshots) to reflect the changes.

After which, you can update the **expected** test files with: `npm run updatetest`

<box type="warning" seamless>
  You should always check that the generated output is correct before committing any changes to the test sites.
</box>

##### Adding test site content

When adding new features, you should also add new site content into an existing test site or create a new test site to demonstrate the new feature. This is to ensure that your feature can be tested by building that test site.

To add a page to an existing test site, for this example, to `test_site`:

1. Add a new test page, e.g., `newTestPage.md`, containing a demonstration of the new feature.

1. Open the `site.json` corresponding to the test site, i.e. `packages/cli/test/functional/test_site/site.json`

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

<box type="info" seamless>

  If creating a new test site instead, the directory name of the new test site should be added to `packages/cli/test/functional/testSites.js` file.
</box>

##### Adding snapshot tests for components

When making changes to the Vue components in `packages/vue-components`, you should add new snapshot tests or adapt existing ones as appropriate.

Once you're done, be sure to run the `updatetest` script mentioned [above](#updating-and-writing-tests)!


## Linting

We follow [our style guides](styleGuides.html). Using a linter will help check and fix some of the code style errors in your code. It will save time for both you and your code reviewer. The linting tool we use is [ESLint](https://eslint.org/) and [StyleLint](https://stylelint.io/). Here is a [gist](https://gist.github.com/nicholaschuayunzhi/bfe53dbb5f1a0f02d545d55956f9ab7e) with an explanation of the ESLint rules chosen in markbind-cli.

Before making a commit or pull request, you should lint your code by running the following commands from the root of your project:

* To lint a specific file: `eslint path/to/specificfile.js`
* To lint all files: `npm run lint`

It is also possible to auto-fix some (not all) style errors, using `npm run lintfix`.

<box type="tip" seamless>

ESLint has [integrations with popular editors](https://eslint.org/docs/user-guide/integrations). They offer features such as "fix errors on save", which will make development smoother.
</box>

## Dependency management

As mentioned in the [setting up](settingUp.html#setting-up-the-dev-environment) page, MarkBind uses [lerna](https://github.com/lerna/lerna) to manage the dependencies of its [various packages](design.html).

Hence, instead of manually updating the version numbers in the packages' `package.json` files, you may consider using the `lerna add` [command](https://github.com/lerna/lerna/tree/master/commands/add#readme) to speed things up!

Also, when updating dependencies, ensure that it is updated in _all_ packages using that dependency.

<box type="warning">
Dependency updates are not trivial, and can be the source of subtle bugs. You should always check the respective dependency changelogs before doing so!
</box>
