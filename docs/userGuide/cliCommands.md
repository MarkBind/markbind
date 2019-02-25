<frontmatter>
  title: "User Guide: Command Line Interface (CLI)"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

# MarkBind CLI

### Overview

MarkBind Command Line Interface (CLI) can be run in the following ways:

* `markbind [--version | -v]`<br>
  Prints the version number of the MarkBind installation in use.<br>
  {{ icon_examples }} `markbind --version`, `markbind -v`
* `markbind [--help | -h]`<br>
  Prints a summary of MarkBind commands.<br>
  {{ icon_examples }} `markbind --help`, `markbind -h`
* `markbind <command> [--help | -h]`
  Print instructions specific to the given `<command>`.<br>
  {{ icon_examples }} `markbind build -h` %%(prints instructions for the `build` command)%%
* `markbind <command> [<args>]`<br>
  Executes the given `<command>` with the given arguments. Available commands are described in the sections below.

<hr><!-- ========================================================================== -->

### `build` Command

**Format:** `markbind build [<OPTIONS>]`<br>
**Alias:** `markbind b`

**Description:** Generates the site to the directory named `_site` in the current directory.

**`OPTIONS`:**
* `<output>`<br>
  Put the generated files in the specified directory<br>
  {{ icon_example }} `../myOutDir`
* `<root> <output>`<br>
  Read source files from the `<root>` directory and put the generated files in the specified `<output>` directory<br>
  {{ icon_example }} `./myWebsite ../myOutDir`
* `--baseUrl <base>`<br>
  Override the `baseUrl` property (read from the `site.json`) with the give `<base>` value.<br>
  {{ icon_example }} `--baseUrl staging`

**{{ icon_examples }}**
* `markbind build`
* `markbind build ./myWebsite ./myOutDir`
* `markbind build ./stagingDir --baseUrl staging`
<hr><!-- ========================================================================== -->

### `deploy` Command

**Format:** `markbind deploy [<OPTIONS>]`<br>
**Alias:** `markbind d`

**Description:** Deploys the site to the repo's Github pages by pushing everything in the generated site (default dir: `_site`) to the `gh-pages` branch of the current git working directory's remote repo.

**`OPTIONS`:**
* `-t <githubTokenName>`, `--travis <githubTokenName>`<br>
  Deploy the site in Travis CI using the GitHub personal access token stored in `<githubTokenName>`. (default: `GITHUB_TOKEN`)<br>
  {{ icon_example }} `-t PA_TOKEN`

%%{{ icon_info }} Related: [User Guide: Deploying the Website]({{ baseUrl }}/userGuide/deployingTheSite.html).%%

<hr><!-- ========================================================================== -->

### `init` Command

**Format:** `markbind init [<OPTIONS>]`<br>
**Alias:** `markbind i`

**Description:** Initializes a directory into a MarkBind site by creating a skeleton structure for the website which includes a `index.md` and a `site.json`.

**`OPTIONS`:**
* `<root>`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`

{{ icon_examples }}
* `markbind init` : Initializes the site in the current working directory.
* `markbind init ./myWebsite` : Initializes the site in `./myWebsite` directory.

<hr><!-- ========================================================================== -->

### `serve` Command

**Format:** `markbind serve [<OPTIONS>]`<br>
**Alias:** `markbind s`

**Description:** Does the following steps:
1. Builds the site and puts the generated files in a directory named `_site`.
1. Starts a web server instance locally and makes the site available at `http://127.0.0.1:8080`.
1. Opens a <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> of the website.

<modal large title="Live Preview" id="modal:cliCommands-livePreview">
<include src="glossary.md#live-preview" inline/>
</modal>

**`OPTIONS`:**
* `<root>`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`
* `-f`, `--force-reload`<br>
   Force live reload to process all files in the site, instead of just the relevant files. This option is useful when you are modifying a file that is not a file type monitored by the <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> feature.
* `-n`, `--no-open`<br>
   Don't open a live preview in the browser automatically.
* `-o <file>`, `--one-page <file>`<br>
   Render and serve only a single page from your website.<br>
  {{ icon_example }} `--one-page guide/index.md`
* `-p <port>`, `--port <port>`<br>
    Serve the website in the specified port.
* `-s <file>`, `--site-config <file>`<br>
   Specify the site config file (default: `site.json`)<br>
   {{ icon_example }} `-s otherSite.json`

{{ icon_examples }}
* `markbind serve`
* `markbind serve ./myWebsite`
* `markbind serve -p 8888 -s otherSite.json`
