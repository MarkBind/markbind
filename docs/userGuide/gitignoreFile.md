{% set title = ".gitignore" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title | safe }}"
  layout: userGuide.md
  keywords: .gitignore
  pageNav: 5
</frontmatter>

# `.gitignore` File

If you are using [Git](https://git-scm.com/) to manage your project, you can use a `.gitignore` file to ignore files that you don't want to be tracked by Git.

Some common files to ignore in a MarkBind project are:

* log files
* build output
* dependencies such as `node_modules`

The following is the auto-generated `.gitignore` file for MarkBind projects when `markbind init` is called:

``` {heading=".gitignore"}
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
_markbind/logs/

# Dependency directories
node_modules/

# Production build files (change if you output the build to a different directory)
_site/

# Env
.env
.env.local

# IDE configs
.vscode/
.idea/*
*.iml
```

<box type="info">

A pre-existing `.gitignore` file will not be overwritten if you are using the `markbind init --convert` command. 

The auto-generation only adds this `.gitignore` if it detects that there is none in your root directory.

</box>