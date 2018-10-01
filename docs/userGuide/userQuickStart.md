<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# User Quick Start

## Requirement

We expect users to have basic knowledge of the following:
- [x] Markdown
- [x] Command-line Environment

## Installation

`MarkBind` can be [installed using npm](https://www.npmjs.com/get-npm).

You can run:
```
$ npm install -g markbind-cli
```
to install `MarkBind` on your system.

After installation, you can run
```
$ markbind
```
to ensure `MarkBind` is successfully installed on your system. You should see:

```
 __  __                  _      ____    _               _
|  \/  |   __ _   _ __  | | __ | __ )  (_)  _ __     __| |
| |\/| |  / _` | | '__| | |/ / |  _ \  | | | '_ \   / _` |
| |  | | | (_| | | |    |   <  | |_) | | | | | | | | (_| |
|_|  |_|  \__,_| |_|    |_|\_\ |____/  |_| |_| |_|  \__,_|

v1.12.0

Usage: index  <command>


Options:

  -V, --version  output the version number
  -h, --help     output usage information


Commands:

  include [options] <file>  process all the fragment include in the given file
  render [options] <file>   render the given file
  init [root]               init a markbind website project
  serve [options] [root]    build then serve a website from a directory
  deploy                    deploy the site to the repo's Github pages.
  build [root] [output]     build a website
```

You can add the help flag (`--help`) to any command to show the help screen.

## Using MarkBind to author a Website

### Create a new site

MarkBind can setup a boilerplate site in the current directory:

```
$ markbind init
```

If you wish to create the site into a new directory, you can do so by running `markbind init ./directory`

After running `init`, two files will be created for you: `index.md` and `site.json`. 

- `index.md` is where you can start writing your contents (and will be rendered as `index.html` later). 
- `site.json` is the configuration file used for MarkBind to build your website correctly. 

**A valid `site.json` file is required to build a MarkBind-driven site**.

You may refer to this [doc](siteConfiguration.html) for more details about how you can configure the `site.json`.

### Authoring your contents

Read more about content authoring [here](contentAuthoring.html).

### Preview your site

After authoring your contents, you can run:

```
$ markbind serve
```

to open a live preview for your generated site.

MarkBind will generate the site in a folder named `_site` in the current directory.

Live reload is enabled to regenerate the site for changes, so you could see the immediate rendering result after you modify the source files.

| Options | Description |
|---|---|
| `-f`, `--force-reload` | Force a full reload of all site files when a file is changed. |
| `-p`, `--port <port>` | The port used for serving your website. |
| `-s`, `--site-config <file>` | Specify the site config file (default: site.json) |
| --no-open | Don't open browser automatically. |

### Build the static site

When you are ready to deploy your website, you can run

```
$ markbind build
```

to build a static website.

By default, MarkBind will generate the site to the folder named `_site` in the current directory, with current directory as the root directory. You can change them using:

```
$ markbind build ./rootFolder ./outputFolder
```

### Deploy the generated site

MarkBind allows you to easily deploy your generated website to Github Pages. You must first set up the working directory as a Github repo.

```
$ markbind deploy
```

By default, it will try to push everything in the generated site (default dir: `_site`) to the `gh-pages` branch of the current git working directory's remote repo.

More details of deployment setting could be found in [here](ghpagesDeployment.html).

</div>
