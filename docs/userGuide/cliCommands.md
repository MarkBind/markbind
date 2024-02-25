<frontmatter>
  title: "User Guide: Command Line Interface (CLI)"
  layout: userGuide.md
  pageNav: default
</frontmatter>

# CLI Commands

<page-nav-print />

### Overview

<box type="info" seamless>

If you do not have MarkBind installed globally, you can still use MarkBind commands by prefixing the commands with `npx`. For example, `markbind init` becomes `npx markbind-cli init`.

If you have MarkBind installed locally, you may also refer to the scripts section of your `package.json` file for the commands you can use. For example, `npm run init` for `markbind init`.
</box>

An overview of MarkBind's Command Line Interface (CLI) can be referenced with `markbind --help`:
```
$ markbind --help
Usage: markbind <command>
 
 Options:
   -V, --version                      output the version number
   -h, --help                         output usage information
 
 Commands:
   init|i [options] [root]            init a markbind website project
   serve|s [options] [root]           build then serve a website from a directory
   build|b [options] [root] [output]  build a website
   deploy|d [options] [root]          deploy the latest build of the site to the repo's Github pages
```
<hr><!-- ========================================================================== -->
<div id="markbind-init">

### `init` Command
<br>

**Format:** `markbind init [options] [root]`

**Alias:** `markbind i`

**Description:** Initializes a directory into a MarkBind site by creating a skeleton structure for the website which includes a `index.md` and a `site.json`.

**Arguments:**
* `[root]`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `-c`, `--convert`<br>
  Convert an existing GitHub wiki or `docs` folder into a MarkBind website. See [Converting an existing GitHub project]({{ baseUrl }}/userGuide/markBindInTheProjectWorkflow.html#converting-existing-project-documentation-wiki) for more information.

* `-t`, `--template` <br>
  When initialising MarkBind, change the template that you start with. See [templates](templates.html).

{{ icon_examples }}
* `markbind init` : Initializes the site in the current working directory.
* `markbind init ./myWebsite` : Initializes the site in `./myWebsite` directory.
* `markbind init --convert --template minimal`: Converts the GitHub wiki or `docs` folder in the current working directory into a minimal MarkBind website.

</panel>
</div>
<hr><!-- ========================================================================== -->

### `serve` Command
<br>

**Format:** `markbind serve [options] [root]`

**Alias:** `markbind s`

**Description:** Does the following steps:
1. Builds the site and puts the generated files in a directory named `_site`.
1. Starts a web server instance locally and makes the site available at `http://127.0.0.1:8080` by default.
1. Opens a <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> of the website.

<modal large header="Live Preview" id="modal:cliCommands-livePreview">
<include src="glossary.md#live-preview"/>
</modal>

**Arguments:**
* `[root]`<br>
  Root directory. The default is the directory where this command was executed.<br>
  {{ icon_example }} `./myWebsite`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `-o <file>`, `--one-page <file>`<br>
 Serves only a single page from your website **initially**. If `<file>` is not specified, it defaults to `index.md`.<br>
  * Thereafter, when changes to source files have been made, the opened pages will be rebuilt if it was affected.<br>
  * Navigating to a new page will build the new page, if it has not been built before, or there were some changes to source files that affected it before navigating to it.<br>
  * {{ icon_example }} `--one-page guide/index.md`

<box type="info" light header="Caveats" style="width: calc(100% - 50px); position: relative; left: 40px;">

Essentially, this optional feature is very useful when writing content, more so if your build times are starting to slow down!

The caveat is that not building all pages during the initial process, or not rebuilding all affected pages when a file changes, will cause your search results for these pages to be empty or outdated, until you navigate to them to trigger a rebuild.
</box>

* `-b`, `--background-build` **[BETA]**<br>
   If `--one-page` is specified, this mode enhances the single-page serve by building the pages that are not yet built
   or marked to be rebuilt in the background.
   
   You can still edit the pages during the background build. When MarkBind detects changes to the source
   files, the background build will stop, rebuild the files affected, then resumes the background build with the
   remaining pages.

* `-s <file>`, `--site-config <file>`<br>
   Specify the site config file (default: `site.json`)<br>
   {{ icon_example }} `-s otherSite.json`

* `-n`, `--no-open`<br>
   Don't open a live preview in the browser automatically.

* `-f`, `--force-reload`<br>
   Force live reload to process all files in the site, instead of just the relevant files. This option is useful when you are modifying a file that is not a file type monitored by the <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> feature.

* `-a <address>`, `--address <address>`<br>
    Specify the server address/host (Default is 127.0.0.1).

* `-p <port>`, `--port <port>`<br>
    Serve the website in the specified port (Default is 8080).

{{ icon_examples }}
* `markbind serve` : Serves the site from the current working directory.
* `markbind serve ./myWebsite` : Serves the site from the `./myWebsite` directory.
* `markbind serve -p 8888 -s otherSite.json` : Serves the site in Port 8888 from the current working directory, using `otherSite.json` as the site configuration file.

</panel>

<hr><!-- ========================================================================== -->

### `build` Command
<br>

**Format:** `markbind build [options] [root] [output]`

**Alias:** `markbind b`

**Description:** Generates the site to the directory named `_site` in the current directory.

**Arguments:**
* `[root]`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`

* `[root] [output]`<br>
  Read source files from the `[root]` directory and put the generated files in the specified `[output]` directory. Default output directory is `_site`.<br>
  {{ icon_example }} `./myWebsite ./myWebsite/myOutDir`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `--baseUrl <base>`<br>
  Override the `baseUrl` property (read from the `site.json`) with the given `<base>` value.<br>
  {{ icon_example }} `--baseUrl staging`

* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`)<br>
  {{ icon_example }} `-s otherSite.json`

**{{ icon_examples }}**
* `markbind build` : Generates the site from the current working directory.
* `markbind build ./myWebsite` : Generates the site from the `./myWebsite` directory.
* `markbind build ./myWebsite ./myOutDir` : Generates the site from the `./myWebsite` directory to the `./myOutDir` directory.
* `markbind build ./stagingDir --baseUrl staging` : Generates the site from the `./stagingDir` directory, with the `baseUrl` property in `site.json` set to `staging`.

</panel>

<hr><!-- ========================================================================== -->

### `deploy` Command
<br>

**Format:** `markbind deploy [options] [root]`

**Alias:** `markbind d`

**Description:** Deploys the site to the repo's GitHub pages by generating the site (default dir: `_site`) and pushing the generated site to the `gh-pages` branch of the current git working directory's remote repo.

**Arguments:**
* `[root]`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `-c <githubTokenName>`, `--ci <githubTokenName>`<br>
  Deploy the site in CI Environments using the GitHub personal access token stored in `<githubTokenName>` (default: `GITHUB_TOKEN`).<br>
  {{ icon_example }} `-c PA_TOKEN`

* `-n`, `--no-build`<br>
  Skips the generation of the site before deploying it. By default, the `deploy` command generates the site before deploying the built site. This command should be used if the site needs to be generated with non-default arguments for the `build` command (e.g. baseUrl is specified using the `--baseUrl` flag for the `markbind build` command).

* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`).<br>
  {{ icon_example }} `-s otherSite.json`

%%{{ icon_info }} Related: [User Guide: Deploying the Website](deployingTheSite.html).%%

**{{ icon_examples }}**
* `markbind deploy` : Deploys after generating the site from the current working directory.
* `markbind deploy ./myWebsite` : Deploys after generating the site from the `./myWebsite` directory.
* `markbind deploy --no-build` : Deploys the site from the current working directory without generating it.

</panel>

<hr><!-- ========================================================================== -->

### `--help` Option
<br>

**Format:** `markbind [command] --help`

**Alias:** `markbind [command] -h`

**Description:** Prints a summary of MarkBind commands or a detailed usage guide for the given `command`.

{{ icon_examples }}
* `markbind --help` : Prints a summary of MarkBind commands.
* `markbind serve --help` : Prints a detailed usage guide for the `serve` command.
