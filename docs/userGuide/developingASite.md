<link rel="stylesheet" href="{{baseUrl}}/css/main.css">

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

After running `init`, two files will be created for you: `index.md` and `site.json`. `index.md` is where you can start writing your contents (and will be rendered as `index.html` later), and [`site.json`](#sitejson) is the configuration file used for MarkBind to build your website correctly. **A valid `site.json` file is required to build a MarkBind-driven site**.

## Preview and serve your site using:
```
$ markbind serve
```

MarkBind will generate the site in a folder named `_site` in the current directory. Live reload is enabled to regenerate the site for changes, so you could see the immediate rendering result after you modify the source files.

| Options | Description |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-p`, `--port <port>` | The port used for serving your website. |
| --no-open | Don't open browser automatically. |


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
```
{
  "baseUrl": "/",
  "pages": [
    {
      "src": "index.md",
      "title": "Hello World"
    }
  ],
  "ignore": [
    "_site/*",
    "*.json",
    "*.md"
  ],
  "deploy": {
    "message": "Site Update."
  }
}

```

| Variable | Description |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **baseUrl** | The url base when you deploy the website. For example, if you are using Github Pages to host your deployed website, and the resulted page is `https://markbind.github.io/site-demo-cs2103/`, then your `baseUrl` would be `/site-demo-cs2103/` (relative to your domain). Later you could use this variable to help you create top-level navigation link in the document. |
| **pages** | An array of the pages config tells MarkBind all the source files that needs to be rendered. The `src` is the page to be rendered; `title` is the page title for the generated web page. |
| **ignore** | Files to be ignored when building the website. By default, MarkBind will copy all the assets into the output folder. The ignore pattern follows the pattern used in [`.gitignore`](https://git-scm.com/docs/gitignore#_pattern_format). You may want to ignore all markdown source files by adding the entry `*.md`. |
| **deploy** | Settings for the Github page deployment. Please refer to this [doc](ghpagesDeployment.html) for more details. |

<include src="../common/userGuideSections.md" />

</div>
