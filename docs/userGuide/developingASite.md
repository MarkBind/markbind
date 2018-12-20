<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Developing a Site with MarkBind

This wiki explains the basic command you need to know to develop a site with MarkBind.

## Init a site with MarkBind

MarkBind can setup a boilerplate site in the current directory:
```
$ markbind init
```

If you wish to create the site into a new directory, you can do so by running `markbind init ./directory`

After running `init`, two files will be created for you: `index.md` and `site.json`. 

- `index.md` is where you can start writing your contents (and will be rendered as `index.html` later). 
- [`site.json`](#sitejson) is the configuration file used for MarkBind to build your website correctly. 

**A valid `site.json` file is required to build a MarkBind-driven site**.

## Preview and serve your site using:

```
$ markbind serve
```

MarkBind will generate the site in a folder named `_site` in the current directory. Live reload is enabled to regenerate the site for changes, so you could see the immediate rendering result after you modify the source files.

| Options | Description |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-f`, `--force-reload` | Force a full reload of all site files when a file is changed. |
| `-p`, `--port <port>` | The port used for serving your website. |
| `-s`, `--site-config <file>` | Specify the site config file (default: site.json) |
| `--one-page <file>` | Render and serve only a single page from your website. |
| --no-open | Don't open browser automatically. |

Note: Live reload is only supported for the following file types:

- `.html`
- `.md`
- `.mbd` (MarkBind file)
- `.mbdf` (MarkBind fragment)

## Build the static site

```
$ markbind build
```

By default, MarkBind will generate the site to the folder named `_site` in the current directory, with current directory as the root directory. You can change them using
```
$ markbind build ./rootFolder ./outputFolder
```

## Deploy the generated site

```
$ markbind deploy
```

By default, it will try to push everything in the generated site (default dir: `_site`) to the `gh-pages` branch of the current git working directory's remote repo.

Please check more details of deployment [here](ghpagesDeployment.html).

### site.json

Let's take a look at this newly created `site.json`:
<include src="siteConfiguration.md#siteConfig" />

</div>
