{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

++**Prerequisites**++

<div class="indented">

  %%{{ icon_ticked }}%% a basic knowledge of [Markdown](https://www.markdownguide.org/basic-syntax/) and [HTML](https://www.w3schools.com/html/) syntax<br>
  %%{{ icon_ticked }}%% a basic knowledge of running CLI commands<br>
  %%{{ icon_ticked }}%% a recent version of [npm](https://www.npmjs.com/get-npm) installed<br>
  %%{{ icon_ticked }}%% [Node.js](https://nodejs.org) {{ node_version }} or higher installed
</div>

There are a few ways to install MarkBind, select one that is most suitable for your use case. If you are unsure, we recommend using the first method.

## Method 1: Install MarkBind globally with npm

<box type="info" seamless>

This method is recommended for most users. It allows you to use MarkBind commands directly in your terminal, particularly useful if you have multiple MarkBind sites.
</box>

++**1. Install MarkBind**++

Run the following command to install MarkBind globally. This will make the `markbind` command available in your terminal.

```
npm install -g markbind-cli
```

Next, run the command `markbind`. If MarkBind has been installed correctly, you should see the MarkBind ascii logo followed by a summary of MarkBind commands as the output.

```
$ markbind
  __  __                  _      ____    _               _
 |  \/  |   __ _   _ __  | | __ | __ )  (_)  _ __     __| |
 | |\/| |  / _` | | '__| | |/ / |  _ \  | | | '_ \   / _` |
 | |  | | | (_| | | |    |   <  | |_) | | | | | | | | (_| |
 |_|  |_|  \__,_| |_|    |_|\_\ |____/  |_| |_| |_|  \__,_|

 v5.x.y
Usage: ...
```

++**2. Initialize a new Project (or Start with an existing Project)**++

<tabs>
  <tab header="Initializing a new project">

Navigate into an empty directory and run the following command to initialize a skeletal MarkBind site in that directory. It will create several new files in the directory e.g., `index.md`, `site.json`.

```
markbind init
```

<include src="tip.md" boilerplate >
<span id="tip_body">
You can add the `--help` flag to any command to show the help screen. <br>
  e.g., `markbind init --help`
</span>
</include>
<include src="tip.md" boilerplate >
<span id="tip_body">
The `init` command populates the project with the [default project template](https://markbind-init-typical.netlify.com/). Refer to [templates](templates.html) section to learn how to use a different template.
</span>
</include>

  </tab>
  <tab header="Starting with an existing project">

Navigate to the project {{ tooltip_root_directory }}.

</tab>
</tabs>

++**3. Preview the site**++

Run the following command in the same directory. It will generate a website from your source files, start a web server, and open a <trigger trigger="click" for="modal:quickStart-livePreview">live preview</trigger> of your site in your default Browser.

<modal large header="Live Preview" id="modal:quickStart-livePreview">
<include src="glossary.md#live-preview"/>
</modal>

```
markbind serve
```

Do some changes to the `index.md` and save the file. The live preview in the Browser should update automatically to reflect your changes.

To stop the web server, go to the console running the `serve` command and press <kbd>CTRL</kbd> + <kbd>C</kbd> (or the equivalent in your OS).

<div id="instruction-next-steps">

++**4. Next steps**++

1. **Update the content of your site**. More info can be found in the [_User Guide: Authoring Contents_](authoringContents.html) section
1. **Deploy your site**. More info can be found in the [_User Guide: Deploying the Site_](deployingTheSite.html) section.

</div>

++**5. Updating your MarkBind version**++

After you have installed MarkBind, you may want to update to the latest version of MarkBind in the future.

```
npm install -g markbind-cli@latest
```

To update to a specific version of MarkBind, replace `latest` with the version number e.g., `5.0.2`.

```
npm install -g markbind-cli@5.0.2
```

If you are using any CI/CD tools, ensure the version of MarkBind is updated in the CI/CD pipeline as well.
- For example, update your GitHub Actions workflow file to use the correct version of MarkBind, if you are using [markbind-action](https://github.com/MarkBind/markbind-action).

---

## Method 2: Install MarkBind locally as a dev-dependency in `package.json`

<box type="info" seamless>

This method is recommended if you
- are creating a documentation site that more than one person will be working on
- want to specify the version of MarkBind to use in your project and manage it via `package.json`
</box>

++**1. Initialize a `package.json` file**++

:glyphicon-hand-right: _If you already have a `package.json` file, skip to step 2._

:glyphicon-hand-right: _If you are working on a MarkBind project that is set up with this method, run `npm ci` to install the dependencies and refer to step 3 for how to run MarkBind commands._

To initialize a npm project in your current working directory, run the following command.

```
npm init
```
You will need to answer the prompts to create a `package.json` file.

<box type="tip" light>

To get a default `package.json` file, run the following command.

```
npm init -y
```

You can always adjust the content of your `package.json` later.

</box>

++**2. Install markbind-cli locally as a dev-dependency**++

```
npm install markbind-cli --save-dev
```

++**3. Add scripts in the `package.json` file**++

To make the commands available via `npm run`, add the following scripts to your `package.json`.

```json
"scripts": {
  "init": "markbind init",
  "build": "markbind build",
  "serve": "markbind serve",
  "deploy": "markbind deploy"
}
```

You are now ready to run MarkBind commands with `npm run xxx` (e.g. `npm run init` for `markbind init`).

* Alternatively, you can use `npx` to run the commands with `npx markbind-cli xxx` (e.g. `npx markbind-cli init` for `markbind init`).

<box type="info" seamless>

If you are using Git to version control your source files, view the [_User Guide: .gitignore File_](gitignoreFile.html) section for more info.
</box>

<include src="gettingStarted.md#instruction-next-steps" />

++**5. Updating your MarkBind version**++

After you have installed MarkBind, you may want to update to the latest version of MarkBind in the future.

Go to your project directory that contains the `package.json` file and run the following command.

```
npm install markbind-cli@latest --save-dev
```

To update to a specific version of MarkBind, replace `latest` with the version number e.g., `5.0.2`.

```
npm install markbind-cli@5.0.2 --save-dev
```

If you are using any CI/CD tools, ensure the version of MarkBind is updated in the CI/CD pipeline as well.
- For example, update your GitHub Actions workflow file to use the correct version of MarkBind, if you are using [markbind-action](https://github.com/MarkBind/markbind-action).

The command will modify your `package.json` and `package-lock.json` file to update the version of MarkBind.

---

## Method 3: Install MarkBind via npx

<box type="info" seamless>

This method is recommended if you want to try out MarkBind without installing it (by using <tooltip content="NPX stands for Node Package eXecute. It is simply an NPM package runner. It allows developers to execute any Javascript Package available on the NPM registry without even installing it.">[npx](https://docs.npmjs.com/cli/commands/npx)</tooltip>).
</box>

++**1. Initialize a MarkBind site**++

```
npx markbind-cli init mySite
```

++**2. Preview the site**++

```
cd mySite
npx markbind-cli serve
```

++**3. See usage information**++

```
npx markbind-cli --help
```

<include src="gettingStarted.md#instruction-next-steps" />

++**5. Updating your MarkBind version**++

To use the latest version of MarkBind in the future, specify `latest` in the command.

```
npx markbind-cli@latest init mySite
```

Or, specify the version number.

```
npx markbind-cli@5.0.2 init mySite
```

{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'authoringContents') }}
