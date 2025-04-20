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
* You can refer to the [_Design_](../design/projectStructure.html) page to learn about the design and implementation of MarkBind.

The sections below has more information about various stages of submitting a PR.

## Writing code

#### General tips

* Use JavaScript ES6 features if possible for better performance, e.g. Promise instead of callback.
* Do note [our style guides](../styleGuides.html).
* Do set up your IDE debugger! We provide several sample configurations for <trigger trigger="click" for="webstorm-debug">WebStorm</trigger> and <trigger trigger="click" for="vs-code-debug">VS Code</trigger>.

  <modal header="Debugging Configurations - WebStorm" id="webstorm-debug" large>
  
  Refer [here](https://blog.jetbrains.com/webstorm/2018/01/how-to-debug-with-webstorm/) for a quick guide on adding debugging and running configuration in WebStorm, and how to run them.
  
  Once done, see these screenshots for sample debugging configurations, and tweak them further to suit your needs.
  
  **1. Using the docs as a development environment**, with:
  * the <a tags="environment--combined" href="/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a><a tags="environment--dg" href="https://markbind.org/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a> option to speed up page building
  * the `-d` developer option. (see [below](#editing-frontend-features))

    {.mb-3}  
  
    ![]({{baseUrl}}/images/debugger/WebStorm_1.png) {.ms-4}
  
  **2. Debugging all tests** in the `npm run test` script:
  
    ![]({{baseUrl}}/images/debugger/WebStorm_2.png) {.ms-4}
    
  **3. Debugging only the cli package's tests**:
    
    ![]({{baseUrl}}/images/debugger/WebStorm_3.png) {.ms-4}
  
  </modal>

  <modal header="Debugging Configurations - VS Code" id="vs-code-debug" large>
  
  Refer [here](https://code.visualstudio.com/docs/editor/debugging) for a general guide on adding and running debugging configurations in VS Code.
  
  In your `.vscode/launch.json` file, you may use these sample configurations as a baseline, and tweak them as you see fit.
  
  **1. Using the docs as a development environment**, with:
  * the <a tags="environment--combined" href="/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a><a tags="environment--dg" href="https://markbind.org/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a> option to speed up page building
  * the `-d` developer option. (see [below](#editing-frontend-features))

    {.mb-3}  
    
    ```json {.ms-4 heading="launch.json"}
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
  
    ```json {.ms-4 heading="launch.json"}
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
    
    ```json {.ms-4 heading="launch.json"}
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

#### Keeping your fork up to date

When new PRs are merged into the `master` branch, your `master` branch will be out of sync with the main repository. One way to update your branches to branch from the latest `master` is as follows:

1. Go to your fork on GitHub and click 'Sync fork' to update your remote `master` branch
![](https://docs.github.com/assets/cb-75616/mw-1440/images/help/repository/sync-fork-dropdown.webp =700x)

1. Checkout and sync your local `master` (the name of your local branch that tracks the remote `master`) branch with `git checkout master && git pull`

1. Checkout your feature branch and [rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) the branch with `git rebase master` or [merge](https://git-scm.com/docs/git-merge) `master` into the branch with `git merge master` 

1. Fix any merge conflicts (if applicable)

<box type="tip" seamless>

You may want to use a tool like [GitTown](https://www.git-town.com/) to speed up the process.
</box>

#### Editing backend features

Some of our backend code files in `packages/core` are written in TypeScript, and you will need to compile those into JavaScript for local execution with our command-line module `packages/cli`.

You can run `npm run build:backend` in the root directory to compile the files, but in some cases, it might be tedious to manually execute the command many times. We recommend you to either:

1. Run `npm run dev` in the root directory. (_Recommended for TypeScript migration_)

   This command starts the compiler's file watcher which will rebuild the relavant files when file changes are detected.

1. Configure your IDE to perform automatic compilation on file change/save. (_Recommended for general development_)

   Refer to your IDE's guides to set this up. For instance, here are the guides for [WebStorm](https://www.jetbrains.com/help/webstorm/compiling-typescript-to-javascript.html#ts_compiler_compile_code_automatically) and [Visual Studio Code](https://code.visualstudio.com/docs/typescript/typescript-compiling#_step-2-run-the-typescript-build).

#### Editing frontend features

We update the frontend `markbind.min.js` and `markbind.min.css` bundles during release only, and not in pull requests.

Hence, if you need to view the latest frontend changes (relating to `packages/core-web` or `packages/vue-components`), you can either:

1. Run `markbind serve -d` (with any other applicable options). (**recommended**)<br>
   This adds the necessary webpack middlewares to the development server to compile the above bundles,
   and enables live and hot reloading for frontend source files.
1. Run `npm run build:web` in the root directory, which builds the above bundles,
   then run your markbind-cli <a tags="environment--combined" href="/userGuide/cliCommands.html">command</a><a tags="environment--dg" href="https://markbind.org/userGuide/cliCommands.html">command</a> of choice.

<div id="workflow-testing">

## Testing

Our test script does the following:

1. Lints the code (`.ts`, `.js`, `.vue`) and stylesheets (`.css`) for any style errors using [ESLint](https://eslint.org/) and [StyleLint](https://stylelint.io/).
1. Runs unit tests for all packages with [Jest](https://jestjs.io/).
1. Builds the test sites whose directory names are listed in `packages/cli/test/functional/testSites.js`.
1. For each test site, compares the HTML files generated with the HTML files in its `expected` directory.

To run the test script, use: `npm run test`

<box type="tip" seamless>

If you only want to run tests for one of the packages (`packages/*`), simply switch into the appropriate directory and use `npm run test` as well!
</box>

<box type="info" seamless>

When running `npm run test`, you may see errors in the console. Some of these errors are **expected** as part of the test cases.
Check the test logs for messages like:

```
info: The following 2 errors are expected to be thrown during the test run:
info: 1: No such segment '#doesNotExist' in file
info: 2: Cyclic reference detected.
```

If an error is listed there, it's safe to ignore.
</box>

#### Updating and writing tests

<box type="warning" seamless>

If you're adding tests that are expected to log new errors to the console, make sure to **update the corresponding info messages** in the test logs.
This ensures that expected errors are properly listed and avoids confusion during test runs.
</box>

##### Updating unit tests

Our unit tests perform fast, stable, and comprehensive checks on important behaviors of our classes and functions. Some existing tests can be found in the `packages/cli/test/unit` and `packages/core/test/unit` directory. Where appropriate, unit tests should be added/modified to account for any new/changed functionality.

##### Updating functional tests

Whether you are adding a new feature, updating existing features or fixing bugs, make sure to update the **source** test files (test sites, snapshots) to reflect the changes.

After which, you can update the <tooltip content="These are located in `expected` folder in the test sites and `__snapshots__` folder for unit tests">**expected** test files</tooltip> with: `npm run updatetest`

<box type="warning" seamless>

  You should always check that the generated output is correct before committing any changes to the test sites.

  Note that some binary files such as images (e.g. `inline-output.png`) or fonts (e.g. `material-icons-outlined.woff`) could show up
  as uncommitted changes due to the way they are generated. If you are not directly modifying those files in your PR, you should **discard those changes** and **do not commit** them.
</box>

<box type="tip" seamless header="Here are the steps to solve merge conflicts in expected test files:">

1. Ensure that your fork is synced with the upstream repository.
2. Ensure that the master branch of your local repository is in sync with the master branch of your fork. 
   Pull from the fork into your local repository as needed.
3. Checkout from your master branch to your PR branch.
   - `git checkout [BRANCH NAME]`
4. Merge your master branch into your PR branch.
   - `git merge master`
5. Accept all changes to any merge conflicts in the generated **expected** test files.
   - It does not matter which changes are accepted, as they will be overridden in the following step.
6. Once your master branch has been successfully merged into your PR branch, run `npm run updatetest` to generate the latest test files.
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
         "frontmatterOverrideProperty": "Overridden by frontmatter override",
         "globalAndFrontmatterOverrideProperty":  "Overridden by frontmatter override"
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

<box type="warning" seamless>

  We do not commit the generated plantuml images in our `test_site` to avoid non-related file changes after `npm run updatetest`.
  The existing list of images to be ignored is maintained in `packages/cli/test/functional/testSites.js` and `.gitignore`.
  They should be updated accordingly if you are making changes to the plantuml content in our `test_site`.
</box>

##### Adding snapshot tests for components

When making changes to the Vue components in `packages/vue-components`, you should add new snapshot tests or adapt existing ones as appropriate.

Once you're done, be sure to run the `updatetest` script mentioned [above](#updating-and-writing-tests)!

</div>

## Documenting

### Adding Intra-Site Links to Documentation

In MarkBind, we use <a tags="environment--combined" href="/userGuide/tweakingThePageStructure.html#plugin-tags">tags</a><a tags="environment--dg" href="https://markbind.org/userGuide/tweakingThePageStructure.html#plugin-tags">tags</a> to differentiate between links in the developer guide referring to the user guide versus links in the user guide referring to the developer guide. Note that intra-site links within either guides need not have tags. 

MarkBind's documentation currently has 3 tags:

- `environment--combined` for deploying the User Guide and Developer Guide together
- `environment--ug` for deployed User Guide
- `environment--dg` for deployed Developer Guide

To ensure that correct links are created, use tags with the links to selectively filter the correct link to be rendered for the right environment. When both the User Guide and the Developer Guide are deployed together, they have access to the files from each other, allowing the relative link to work. However, when they are deployed individually, this is not the case. Using absolute links creates the same effect as the relative link without having to have access to the files from the other guide.

#### Developer Guide
%%LINK:%%
```markdown
[Link Title](/userGuide/newPage.html)
```

%%REPLACED WITH:%%
```html
<a tags="environment--combined" href="/userGuide/newPage.html">Link Title</a>
<a tags="environment--dg" href="https://markbind.org/userGuide/newPage.html">Link Title</a>
```

#### User Guide
%%LINK:%%
```markdown
[Link Title](/devGuide/newPage.html)
```

%%REPLACED WITH:%%
```html
<a tags="environment--combined" href="/devGuide/newPage.html">Link Title</a>
<a tags="environment--ug" href="https://markbind.org/devdocs/devGuide/newPage.html">Link Title</a>
```

## Linting

We follow [our style guides](../styleGuides.html). Using a linter will help check and fix some of the code style errors in your code. It will save time for both you and your code reviewer. The linting tool we use is [ESLint](https://eslint.org/) and [StyleLint](https://stylelint.io/). Here is a [gist](https://gist.github.com/nicholaschuayunzhi/bfe53dbb5f1a0f02d545d55956f9ab7e) with an explanation of the ESLint rules chosen in markbind-cli.

Before making a commit or pull request, you should lint your code by running the following commands from the root of your project:

* To lint a specific file: `eslint path/to/specificfile.js`
* To lint all files: `npm run lint`

It is also possible to auto-fix some (not all) style errors, using `npm run lintfix`.

<box type="tip" seamless>

ESLint has [integrations with popular editors](https://eslint.org/docs/user-guide/integrations). They offer features such as "fix errors on save", which will make development smoother.
</box>

## Git hooks
We have three git hooks in our project. We use [pre-commit](https://pre-commit.com/) to manage our git hooks.<br>
The pre-commit scripts are located in `./pre-commit/pre-commit-scripts` and the config is found in `./pre-commit-config.yaml`.

To skip running the pre-commit hook or pre-push hook, you can use the --no-verify flag (e.g. git push --no-verify origin fork_branch).

* `post-checkout`: When you checkout to another branch, this hook will run clean and build the backend.
* `pre-commit`: This hook will run clean, build the backend, and run lintfix on all the files.
* `pre-push`: This hook will run clean, build the backend, and run all the test cases.

## Dependency management

As mentioned in the [setting up](settingUp.html#setting-up-the-dev-environment) page, MarkBind uses [lerna](https://github.com/lerna/lerna) to manage the dependencies of its [various packages](../design/projectStructure.html).

### To add a dependency

Add your dependency into the appropriate `package.json` file inside `packages/*`. If this is a development dependency to be used across all packages (e.g. ESLint), add it the the root `package.json`.

Then, simply rerun the `npm run setup` command to update the `package-lock.json` files.

### To delete a dependency

The safest way is to first remove the particular dependency entry from the `package.json` file of the respective directory. Then, run `npm run setup` in the root directory to clean up the local dependencies and update the `package-lock.json` file.

### To update a dependency

First, follow the instruction to [delete the dependency](#to-delete-a-dependency). Then, follow the instruction to [add the latest dependency](#to-add-a-dependency) back. Also, when updating dependencies, ensure that it is updated in _all_ packages using that dependency.

<box type="warning">

Dependency updates are not trivial, and can be the source of subtle bugs. You should always check the respective dependency changelogs before doing so!
</box>

### Points for consideration

There are a few ways to incorporate external packages into MarkBind, each with its pros and cons. The following table shows some of the common trade-offs:

Approach          | Pros                                                                                                                                                                 | Cons                                                                                                                            |
:-----------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------|
Installing | <ul><li>Ease of upgrade</li><li>Traceable in `package.json`</li></ul>                                                                                                | <ul><li>May not satisfy custom behavior</li><li>Become vulnerable if the source repo is no longer actively maintained</li></ul>
Forking           | <ul><li>Relatively easy to upgrade</li><li>Leverage upstream testing procedures</li><li>Benefit others who share the same use cases</li></ul>                                                           | <ul><li>May become out-of-sync with the latest version</li><li>Difficult to maintain it externally in the long run</li></ul>
Patching          | <ul><li>Quick - no need to maintain / publish more npm packages or setup release procedures etc</li><li>Ensure the changes propagate to other dependencies</li><li>Enjoy the benefits of monorepo</li></ul> | <ul><li>Difficult to upgrade</li></ul>

As the choice is highly dependent on context and details of the implementation, below are some additional questions to ask before proceeding:

* Is the package actively maintained?
* How big is the package?
* How invasive are the proposed changes?
* Are there existing APIs/plugin system from the package (to modify default behaviors)?

<box type="tip" seamless>

Find out more about the key external libraries used in MarkBind from the [project structure](../design/projectStructure.md) section. Also, the rationales behind most existing patches are documented in their respective files, read them (and their respective PRs/issues) for more context!
</box>

### Updating PlantUML

PlantUML is a third-party library used by MarkBind to create UML diagrams. MarkBind runs the PlantUML JAR file found in `packages/core/src/plugins/default` when building the site to generate the diagrams.

To update PlantUML to a newer version:

1. Download the JAR file from [PlantUML's website](https://plantuml.com/download).
1. Rename the file to `plantuml.jar` (if required), and replace the existing JAR file located in `packages/core/src/plugins/default`.
1. Check the HTML pages that contain PlantUML diagrams, i.e. `/userGuide/components/imagesAndDiagrams.html`.

### Updating Bootstrap and Bootswatch

As Bootswatch is built on Bootstrap, ensure that the versions of both are in sync to avoid unexpected differences in styling behavior between default and other themes. Both are currently using version 5.1.3.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('settingUp', 'writingComponents') }}
