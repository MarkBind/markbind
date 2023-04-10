{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide.md
</frontmatter>

# {{ title }}

++**Prerequisites**++

<div class="indented">

  %%{{ icon_ticked }}%% a basic knowledge of [Markdown](https://www.markdownguide.org/basic-syntax/) and [HTML](https://www.w3schools.com/html/) syntax<br>
  %%{{ icon_ticked }}%% a basic knowledge of running CLI commands<br>
  %%{{ icon_ticked }}%% a recent version of [npm](https://www.npmjs.com/get-npm) installed<br>
  %%{{ icon_ticked }}%% [Node.js](https://nodejs.org) {{ node_version }} or higher installed
</div>

<box type="tip" header="##### Quick Start :rocket:" >

Initialize a MarkBind site:

```
npx markbind-cli init mySite
```

Preview the site:

```
cd mySite
npx markbind-cli serve
```

See usage information:

```
npx markbind-cli --help
```

</box>

++**1. Install MarkBind**++

Run the following command to install MarkBind.
```
$ npm install -g markbind-cli
```

Next, run the command `markbind`. If MarkBind has been installed correctly, you should see the MarkBind ascii logo followed by a summary of MarkBind commands as the output.

```
$ markbind
  __  __                  _      ____    _               _
 |  \/  |   __ _   _ __  | | __ | __ )  (_)  _ __     __| |
 | |\/| |  / _` | | '__| | |/ / |  _ \  | | | '_ \   / _` |
 | |  | | | (_| | | |    |   <  | |_) | | | | | | | | (_| |
 |_|  |_|  \__,_| |_|    |_|\_\ |____/  |_| |_| |_|  \__,_|

 v3.x.y
Usage: ...
```

<panel header="Alternative installation: as a local dev-dependency with `package.json`">

++**1. Initialize a `package.json` file**++

:glyphicon-hand-right: _If you already have a `package.json` file, skip to the next step._

To initialize a npm project in your current working directory, run the following command.

```
$ npm init
```
You will need to answer the prompts to create a `package.json` file.

<box type="tip" light>

To get a default `package.json` file, run the following command.

```
$ npm init -y
```

You can always adjust the content of your `package.json` later.

</box>

++**2. Install markbind-cli locally as a dev-dependency**++

```
$ npm install markbind-cli --save-dev
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

</panel>

<br>

++**2. Initialize a new Project (or Start with an existing Project)**++

<tabs>
  <tab header="Initializing a new project">

Navigate into an empty directory and run the following command to initialize a skeletal MarkBind site in that directory. It will create several new files in the directory e.g., `index.md`, `site.json`.

```
$ markbind init
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
$ markbind serve
```

Do some changes to the `index.md` and save the file. The live preview in the Browser should update automatically to reflect your changes.

To stop the web server, go to the console running the `serve` command and press <kbd>CTRL</kbd> + <kbd>C</kbd> (or the equivalent in your OS).

++**4. Next steps**++

1. **Update the content of your site**. More info can be found in the [_User Guide: Authoring Contents_](authoringContents.html) section
1. **Deploy your site**. More info can be found in the [_User Guide: Deploying the Site_](deployingTheSite.html) section.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'authoringContents') }}
