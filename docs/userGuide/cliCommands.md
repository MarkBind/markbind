<frontmatter>
  title: "User Guide: Command Line Interface (CLI)"
  layout: userGuide.md
  pageNav: default
</frontmatter>

# MarkBind CLI

### Overview

An overview of MarkBind's Command Line Interface (CLI) can be referenced with `markbind --help`:

```bash
$ markbind --help
Usage: markbind <command>
 
 Options:
   -V, --version                                      output the version number
   -h, --help                                         output usage information
 
 Commands:
   init|i [options] [root]                            init a markbind website project
   serve|s [options] [root]                           build then serve a website from a directory
   build|b [options] [root] [output]                  build a website
   archive|ar <versionName> [options]                 archive the current version of the site
   deploy|d [options]                                 deploy the site to the repo's GitHub pages
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
1. Starts a web server instance locally and makes the site available at `http://127.0.0.1:8080`.
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

* `-p <port>`, `--port <port>`<br>
  Serve the website in the specified port.

* `-v [versionNames...]`, `--versions [versionNames...]` <br>
  Specify versions to be served, separated by spaces. If the flag is used without specification, serve no versions. Using this option overrides the setttings in [site.json](siteJsonFile.md).

{{ icon_examples }}

* `markbind serve`
* `markbind serve ./myWebsite`
* `markbind serve -p 8888 -s otherSite.json`
* `markbind serve -n -v LTS 1.0` : Serve the site without opening a live preview in the browser, and also serving the archived version named "LTS" and "1.0".

</panel>

<hr><!-- ========================================================================== -->

### `build` Command
<br>

**Format:** `markbind build [options] [root] [output]`

**Alias:** `markbind b`

**Description:** Generates the site to the directory named `_site` in the current directory.

**Arguments:**

* `[output]`<br>
  Put the generated files in the specified directory<br>
  {{ icon_example }} `../myOutDir`

* `[root] [output]`<br>
  Read source files from the `[root]` directory and put the generated files in the specified `[output]` directory<br>
  {{ icon_example }} `./myWebsite ../myOutDir`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `--baseUrl <base>`<br>
  Override the `baseUrl` property (read from the `site.json`) with the give `<base>` value.<br>
  {{ icon_example }} `--baseUrl staging`

* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`)<br>
  {{ icon_example }} `-s otherSite.json`

* `-v [versionNames...]`, `--versions [versionNames...]` <br>
  Specify versions to be kept in the generated site, separated by spaces. If the flag is used without specification, keep no versions. Using this option overrides the setttings in [site.json](siteJsonFile.md).

**{{ icon_examples }}**

* `markbind build`
* `markbind build ./myWebsite ./myOutDir`
* `markbind build ./stagingDir --baseUrl staging`
* `markbind build -v v2.1.1` : Build the site with the version named 'v2.1.1' in addition to the current version

</panel>

<hr><!-- ========================================================================== -->

### `archive` Command
<br>

**Format:** `markbind archive <versionName> [options]`

**Alias:** `markbind ar <versionName>`

**Description:** Does the following steps:

1. Builds the current site, ignoring previously archived versions.
1. Updates or creates a `versions.json` file to track the newly archived version.
1. Puts the generated files in the specified `archivePath` folder (By default, the archive path is "version/<versionName>")

**Arguments:**

* `<versionName>`<br>
  The name of the version. This is required, and names must be unique; using the same name and archivePath will result in the previous archived files being overwritten.<br>
  {{ icon_example }} `v1`, `v1.1.1`, `sem1-2022`

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`)<br>
  {{ icon_example }} `-s otherSite.json`
* `-ap <archivePath>`, `--archive-path <archivePath>`<br>
  All archived versions are stored in the folder `<archivePath>`. If not specified, the archive path is `version/${versionName}` <br>
  {{ icon_example }} `-ap custom_archive_path`

<div id="archiveWarning">
  <box type="warning">

  Warning: If the folder at `<archivePath>` already exists, the contents will be overwritten and your previous files may be lost. Only do so if you need to replace all the archived files with the current site files.

  (Also note that you cannot save a version with the same name into a different archive path.)
  </box>
</div>

**{{ icon_examples }}**

* `markbind archive v1`: Stores the archived site in the directory `./version/v1` as the version named 'v1'
* `markbind archive version_1 -ap custom_archive_path`: Stores the archived site in the directory `./custom_archive_path`, and the version is named version_1.

%%{{ icon_info }} Related: [User Guide: Site Versioning](versioning.md).%%

</panel>

<hr><!-- ========================================================================== -->

### `deploy` Command
<br>

**Format:** `markbind deploy [options]`

**Alias:** `markbind d`

**Description:** Deploys the site to the repo's GitHub pages by pushing everything in the generated site (default dir: `_site`) to the `gh-pages` branch of the current git working directory's remote repo.

<panel header="**Options** :fas-cogs:" type="minimal" expanded>

**Options** :fas-cogs:

* `-c <githubTokenName>`, `--ci <githubTokenName>`<br>
  Deploy the site in CI Environments using the GitHub personal access token stored in `<githubTokenName>`. (default: `GITHUB_TOKEN`)<br>
  {{ icon_example }} `-c PA_TOKEN`

%%{{ icon_info }} Related: [User Guide: Deploying the Website](deployingTheSite.html).%%

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
