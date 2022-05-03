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

Simply install MarkBind's command-line interface package to build, serve and deploy a MarkBind site.
There are a few different to do this:

https://blog.scottlogic.com/2018/04/05/npx-the-npm-package-runner.html
https://docs.npmjs.com/cli/v8/commands/npx
https://reactjs.org/docs/create-a-new-react-app.html#create-react-app
https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b

* `npx`
  * Calling npx markbind-cli when markbind-cli isn’t already in your $PATH will automatically install a package with that name from the npm registry for you, and invoke it. When it’s done, the installed package won’t be anywhere in your globals, so you won’t have to worry about pollution in the long-term.
* `npm - global installation`
  * Install the package globally, and it will be available for all local projects.
* `package.json`
  * Install the package locally, and manage its version using a package.json.

++**1. Install MarkBind**++

Run the following command to install MarkBind.

<tabs>
<tab header="npx">

If you are using MarkBind frequently, follow the steps in `package.json` to install it locally.

</tab>
<tab header="npm - global installation">

Install the package globally, and it will be available for all local projects.

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

 v2.x.y
Usage: ...
```
</tab>
<tab header="package.json">

If you have not initialized an npm project, you can initialize one by running the following command.

```
$ npm init
```
You will need to answer the prompts to create a package.json file. To get a default package.json file, run the following command.

```
$ npm init -y
```
You can always adjust the content of your package.json later.

Then, install the package locally as a dev-dependency.

```
$ npm install markbind-cli --save-dev
```

To make the commands available, add the following scripts to your package.json.

```
"scripts": {
  "init": "markbind init",
  "build": "markbind build",
  "serve": "markbind serve",
  "deploy": "markbind deploy -ci"
}
```

</tab>
</tabs>

++**2. Initialize a new Project (or Start with an existing Project)**++

<tabs>
  <tab header="Initializing a new project">

Navigate into an empty directory and run the following command to initialize a skeletal MarkBind site in that directory. It will create several new files in the directory e.g., `index.md`, `site.json`.

<tabs>
<tab header="npx">

```
$ npx markbind-cli init
```
</tab>
<tab header="npm - global installation">

```
$ markbind init
```
</tab>
<tab header="package.json">

```
$ npm run init
```
</tab>
</tabs>

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
<include src="glossary.md#live-preview" inline/>
</modal>

<tabs>
<tab header="npx">

```
$ npx markbind-cli serve
```
</tab>
<tab header="npm - global installation">


```
$ markbind serve
```
</tab>
<tab header="package.json">

```
$ npm run serve
```
</tab>
</tabs>

Do some changes to the `index.md` and save the file. The live preview in the Browser should update automatically to reflect your changes.

To stop the web server, go to the console running the `serve` command and press <kbd>CTRL</kbd> + <kbd>C</kbd> (or the equivalent in your OS).

++**4. Next steps**++

1. **Update the content of your site**. More info can be found in the [_User Guide: Authoring Contents_](authoringContents.html) section
1. **Deploy your site**. More info can be found in the [_User Guide: Deploying the Site_](deployingTheSite.html) section.
1. **Update your MarkBind version when necessary**.
{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'authoringContents') }}
