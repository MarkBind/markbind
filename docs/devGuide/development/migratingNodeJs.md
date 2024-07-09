{% set title = "Migrating Node.js" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

Node.js versions have to upgraded periodically before the version being used reaches its [end of life](https://endoflife.date/nodejs).
This page outlines the steps of migrating to a higher version of Node.js.
</div>

### Preparation

#### Choosing Node.js version
Before upgrading the Node.js version, it is important to decide which version to upgrade to. 
Broadly speaking, migrate only to even-numbered Node.js releases as only even-numbered versions will be provided with Long-Term Support. 

Read more about Node.js release lines [here](https://nodesource.com/blog/understanding-how-node-js-release-lines-work/).

The npm version will be upgraded automatically accordingly to the Node.js version since it is downloaded alongside Node.js. Hence, do check that this upgrade does not cause any issues.
<box type="info" seamless>
If a different version of npm is needed this can be overridden. This will be explained further below.
</box>

#### Setup 

Install <tooltip content="Node Version Manager">[nvm](https://github.com/nvm-sh/nvm)</tooltip> to help switch between different node versions.
Switch to use the Node.js version that you are migrating to.

### Migration steps

1. Refactor any deprecated syntax
    - Go to the [Node.js changelog](https://nodejs.org/en/blog/release) of the new version
    - Go through the list of deprecated syntax and check if it is being used in MarkBind
    - Replace any deprecated syntax
2. Check that all user-facing functionalities are working
    - A quick way to do this is to go to the <a tags="environment--combined" href="/userGuide/readerFacingFeatures.html">Reader Facing Features in the User Guide</a><a tags="environment--dg" href="https://markbind.org/userGuide/readerFacingFeatures.html">Reader Facing Features in the User Guide</a>.
3. Check that there are no issues with development setup
    - Set up the development environment by running through the steps in [Setting Up]({{baseUrl}}/devGuide/development/settingUp.html) to ensure there are no problems
4. Update GitHubActions
    - Go to [MarkBind/markbind-action](https://github.com/MarkBind/markbind-action) and update the Node.js version numbers
        - See [Update node version from 14 to 16 PR](https://github.com/MarkBind/markbind-action/pull/8/files) for an example
    - Test there are no issues with workflows
        - Testing instructions located here: [markbind-action]({{baseUrl}}/devGuide/githubActions/markbindAction.html) and [markbind-reusable-workflows]({{baseUrl}}/devGuide/githubActions/markbindReusableWorkflows.html)
          <box type="info" seamless header="If a different npm version is needed">
        
          Install correct version of npm in `action.yml` and `fork-build.yml`. Refer to [Update node version from 14 to 16 PR](https://github.com/MarkBind/markbind-action/pull/8/files) to see where npm install should be run. </box>
5. Check deployment to Netlify/other platforms
    - Deployment to Netlify
        - Follow steps in <a tags="environment--combined" href="/userGuide/deployingTheSite.html#deploying-to-netlify">Deploying to Netlify</a><a tags="environment--dg" href="https://markbind.org/userGuide/deployingTheSite.html#deploying-to-netlify">Deploying to Netlify</a> but change the `NODE_VERSION` value accordingly. Check there are no issues with deployment and deployed site is as expected.
        - MarkBind has two repos [init-minimal-netlify](https://github.com/MarkBind/init-minimal-netlify) and [init-typical-netlify](https://github.com/MarkBind/init-typical-netlify) which allows deployment to Netlify by using a config file. Update the config file `netlify.toml` with the correct Node.js version and check that deployment using button in `README` works as expected.
          <box type="info" seamless header="If a different npm version is needed">
          
          To specify the npm version add an environment variable `NPM_VERSION` with the correct version number. </box>
    - Deployment to Github pages
        - Using the `markbind deploy command`
            - Build site using correct Node.js version
            - Follow steps in <a tags="environment--combined" href="/userGuide/deployingTheSite.html#deploying-to-github-pages">Using the `markbind deploy` command</a><a tags="environment--dg" href="https://markbind.org/userGuide/deployingTheSite.html#deploying-to-github-pages">Using the `markbind deploy` command</a> and check there are no issues with deployment or with the site.
        - Using CI platforms
            - Follow steps in <a tags="environment--combined" href="/userGuide/deployingTheSite.html#using-ci-platforms">Using CI Platforms</a><a tags="environment--dg" href="https://markbind.org/userGuide/deployingTheSite.html#using-ci-platforms">Using CI Platforms</a> but update the config files for the various CI Platforms to use the correct Node.js version. Try deploying and ensure there are no problems with deployment.
              <box type="info" seamless header="If a different npm version is needed">
              Install the correct npm version before running npm commands. </box>
6. Update documentation
    - Update Node.js and npm version in documentation. See [Update to use Node 16](https://github.com/MarkBind/markbind/pull/2233/files#diff-0f8e38868f41667abec6adacbb5131fbd6999c4913fc43e3429390b744f7a1f3) as an example. <box type="tip" seamless>
      Don't forget to update the version numbers in the example config files in <a tags="environment--combined" href="/userGuide/deployingTheSite.html">Deploying the Site</a><a tags="environment--dg" href="https://markbind.org/userGuide/deployingTheSite.html">Deploying the Site</a>!
      </box>
7. Update `neftlify.toml`
    - The `neftlify.toml` file in the `markbind` repo's root directory is used to deploy our documentation site to Netlify. Update the `NODE_VERSION` value to the new Node.js version.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('writingPlugins', '../design/projectStructure') }}
