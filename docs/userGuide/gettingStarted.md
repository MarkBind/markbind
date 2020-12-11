{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide.md
</frontmatter>

# {{ title }}

<big>**Prerequisites**</big>

<div class="indented">

  %%{{ icon_ticked }}%% a basic knowledge of [Markdown](https://www.markdownguide.org/basic-syntax/) and [HTML](https://www.w3schools.com/html/) syntax<br>
  %%{{ icon_ticked }}%% a basic knowledge of running CLI commands<br>
  %%{{ icon_ticked }}%% a recent version of [npm](https://www.npmjs.com/get-npm) installed<br>
  %%{{ icon_ticked }}%% [Node.js](https://nodejs.org) v10.13.0 or higher installed
</div>

<big>**1. Install MarkBind**</big>

Run the following command to install MarkBind.
``` {.no-line-numbers}
$ npm install -g markbind-cli
```

Next, run the command `markbind`. If MarkBind has been installed correctly, you should see the MarkBind ascii logo followed by a summary of MarkBind commands as the output.

``` {.no-line-numbers}
$ markbind
  __  __                  _      ____    _               _
 |  \/  |   __ _   _ __  | | __ | __ )  (_)  _ __     __| |
 | |\/| |  / _` | | '__| | |/ / |  _ \  | | | '_ \   / _` |
 | |  | | | (_| | | |    |   <  | |_) | | | | | | | | (_| |
 |_|  |_|  \__,_| |_|    |_|\_\ |____/  |_| |_| |_|  \__,_|

 v2.x.y
Usage: ...
```
<big>**2. Initialize a new Project (or Start with an existing Project)**</big>

<tabs>
  <tab header="Initializing a new project">

Navigate into an empty directory and run the following command to initialize a skeletal MarkBind site in that directory. It will create several new files in the directory e.g., `index.md`, `site.json`.

``` {.no-line-numbers}
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


<big>**3. Preview the site**</big>

Run the following command in the same directory. It will generate a website from your source files, start a web server, and open a <trigger trigger="click" for="modal:quickStart-livePreview">live preview</trigger> of your site in your default Browser.

<modal large header="Live Preview" id="modal:quickStart-livePreview">
<include src="glossary.md#live-preview" inline/>
</modal>

``` {.no-line-numbers}
$ markbind serve
```

Do some changes to the `index.md` and save the file. The live preview in the Browser should update automatically to reflect your changes.

To stop the web server, go to the console running the `serve` command and press <kbd>CTRL</kbd> + <kbd>C</kbd> (or the equivalent in your OS).


<big>**4. Next steps**</big>

1. **Update the content of your site**. More info can be found in the [_User Guide: Authoring Contents_](authoringContents.html) section
1. **Deploy your site**. More info can be found in the [_User Guide: Deploying the Site_](deployingTheSite.html) section.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'authoringContents') }}
