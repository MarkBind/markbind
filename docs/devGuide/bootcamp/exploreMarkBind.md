{% set title = "Explore MarkBind as a User" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: 3
</frontmatter>

# {{ title }}

<div class="lead">

Getting to know MarkBind as a user will help you understand what MarkBind offers and how it can be used to create static websites. This will also help you understand the different components and syntax available in MarkBind, which will be useful when you want to debug issues or create similar features in the future.

</div>

## TLDR

- [ ] Setup the master branch MarkBind
- [ ] Create a MarkBind site
- [ ] Create content with MarkBind
- [ ] Modify site structure and configuration
- [ ] Deploy your MarkBind site

## Setup the master branch MarkBind

As mentioned in our [user guide]({{baseUrl}}/userGuide/gettingStarted.html), we can either install MarkBind via npm or create a new MarkBind site with npx.

In this bootcamp, we want to set up the master branch MarkBind so that we can test out any changes we make to the codebase on our local machine.

<box type="tip" light>

You can also switch between the master branch MarkBind and check out other branches if you are working on multiple issues. This is also useful when you want to test out a PR submitted by another developer.

</box>

<panel src="{{baseUrl}}/devGuide/development/settingUp.md" header="**Setting up MarkBind**" type="info" minimized></panel>

<box type="important" light>

**Checkpoint**

After setting up MarkBind, try running from the root directory of your MarkBind repository:
- [ ] `markbind -v` to check that you have the correct version of MarkBind installed
- [ ] `cd docs && markbind serve -d` to check that you can serve the MarkBind documentation site in development mode

If you can browse the MarkBind documentation site at http://localhost:8080, you have successfully set up MarkBind!

</box>

## Create a MarkBind site

With MarkBind installed, we can now create a new MarkBind site.

We recommend that you set up a new repository for this MarkBind site so that you can push your site to GitHub pages later. This MarkBind site can be used to test out any changes you make to the codebase.

As an example, let's create a test site together!

1. Create a new folder called <tooltip content="replace 'xxx' with your GitHub username">"mb-dev-xxx"</tooltip> at a location outside of the MarkBind source code directory.
1. Go to the folder and run `markbind init` to create a new MarkBind site with the default template.
1. Initialize a new git repository in the folder by running `git init`. You can also create a new public repository on GitHub first and clone it to your local machine.

You should see the following output:
```
$ markbind init
  __  __                  _      ____    _               _
 |  \/  |   __ _   _ __  | | __ | __ )  (_)  _ __     __| |
 | |\/| |  / _` | | '__| | |/ / |  _ \  | | | '_ \   / _` |
 | |  | | | (_| | | |    |   <  | |_) | | | | | | | | (_| |
 |_|  |_|  \__,_| |_|    |_|\_\ |____/  |_| |_| |_|  \__,_|

 v4.0.2
info: Initialization success.
```

4. With the site generated, create a `.gitignore` file in the root directory and add the [recommended content]({{baseUrl}}/userGuide/gitignoreFile.html) to it. This is to ensure log files etc are not committed to the repository.


<box type="important" light>

**Checkpoint**

After setting up the MarkBind test site, try running the following common operations from the root directory of your test site:
- [ ] Build the site by running `markbind build`
- [ ] Serve the site by running `markbind serve`
- [ ] Serve the site in development mode by running `markbind serve -d`

You now have the test site up and running!

</box>

## Create Content with MarkBind

MarkBind contains a range of additional syntax on top of Markdown. It also comes with a set of components that can be used to create content.

Two essential sections of the user guide to get started with are:
- [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html) - Covering Markdown & Markdown-like syntax.
- [Using Components]({{baseUrl}}/userGuide/usingComponents.html) - Covering MarkBind components (Built with Vue.js or Native HTML).

<panel src="{{baseUrl}}/userGuide/authoringContents.md" header="**Creating Content**" type="info" minimized></panel>

The generated MarkBind site from the above step also includes a few sample usage in the `index.md` file.

Now, let's try editing the `index.md` file to add some content of our own!

1. Open the `index.md` file in your `mb-dev-xxx` folder.
1. Replace the wording `Landing Page Title` with `MarkBind Developer Test Site`.
1. Modify or add some content utilizing one or more of the following syntaxes:
    - [Text Styles]({{baseUrl}}/userGuide/formattingContents.html#text-styles)
    - [Code Block]({{baseUrl}}/userGuide/formattingContents.html#code)
    - [Emoji]({{baseUrl}}/userGuide/formattingContents.html#emoji)
    - etc.
1. Modify or add some content utilizing one or more of the following components:
    - [Box]({{baseUrl}}/userGuide/components/presentation.html#boxes)
    - [Panel]({{baseUrl}}/userGuide/components/presentation.html#panels)
    - [Tooltip]({{baseUrl}}/userGuide/components/popups.html#tooltips)
    - etc.

<box type="important" light>

**Checkpoint**

With live preview, you should be able to see the changes you have made to the site after saving. Check that the following are true:
- [ ] Serve the site by running `markbind serve -d`
- [ ] Make changes to the `index.md` file and save
- [ ] See the changes reflected in the live preview, with the correct rendering of the syntax and components

You now have created content with MarkBind!

</box>

## Modify Site Structure and Configuration

There are a few ways to modify the site's (as well as the page's) structure and configuration. We will cover the following:
- [Frontmatter]({{baseUrl}}/userGuide/tweakingThePageStructure.html#frontmatter)
- [Layouts]({{baseUrl}}/userGuide/tweakingThePageStructure.html#layouts)
- [site.json]({{baseUrl}}/userGuide/siteJsonFile.html)

Let's continue with the test site we created earlier and modify the `index.md` file via frontmatter.

1. Open the `index.md` file in your `mb-dev-xxx` folder.
1. Change the `pageNavTitle` in the frontmatter from `Chapters of This Page` to `Index Page`.
1. Change the `pageNav` in the frontmatter from `2` to `1`.

<box type="important" light>

**Checkpoint**

Ensure that you are still serving the site with `markbind serve -d`. Check that the following are true:
- [ ] The rendered page navigation title is changed to `Index Page`
- [ ] The rendered page navigation content only shows `H1` headings

</box>

Another commonly adjusted structure is the layout of the site (especially, the site's top header and the left-hand-side navigation).

1. Open the `_markbind/layouts/default.md` file in your `mb-dev-xxx` folder.
1. Change `Your Logo` to `MarkBind Developer Test Site`.
1. Change `Home :house:` to `My Test Playground :computer:`.

<box type="important" light>

**Checkpoint**

Ensure that you are still serving the site with `markbind serve -d`. Check that the following are true:
- [ ] The rendered page logo in the header is changed to `MarkBind Developer Test Site`
- [ ] The rendered site navigation title is changed to `My Test Playground` :computer:

</box>

Lastly, let's modify the site configuration to change the site title and more.

The `site.json` file is autogenerated and located in the root directory of the site.

1. Open the `site.json` file in your `mb-dev-xxx` folder.
1. Change `"titlePrefix": "",` to `"titlePrefix": "mb-dev-xxx",`.
1. Change `"title": "Landing Page"` to `"title": "Home"`.

<box type="important" light>

**Checkpoint**

Ensure that you are still serving the site with `markbind serve -d`. Check that the following are true:
- [ ] The page title in the browser tab is changed to `mb-dev-xxx - Home`

You now have modified some of the commonly adjusted site structure and configuration!
</box>

## Deploy your MarkBind site

MarkBind sites can be easily deployed with CLI commands or via CI. Let's try deploying our site via GitHub Actions.

1. Open the `site.json` file in your `mb-dev-xxx` folder.
1. Change `"baseUrl": "",` to `"baseUrl": "/mb-dev-xxx",` (Note the leading `/` and that the value is the same as your GitHub repository name).
1. Create a `.github/workflows/deploy.yml` file with the following content mentioned in the [GitHub Actions guide]({{baseUrl}}/userGuide/deployingTheSite.html#deploying-via-github-actions).
   1. Note that you should change `branches: master` to `branches: main` if you are using the `main` branch.

<panel src="{{baseUrl}}/userGuide/deployingTheSite.md#markbind-action-tip" header="**MarkBind Action**" type="info" expanded/>

4. Ensure that you have added your remote GitHub repository to your local repository with the following command (replace `xxx` with your GitHub username):
    ```bash
    git remote add origin https://github.com/xxx/mb-dev-xxx.git
    ```
5. Commit and push the changes to the `main` branch with the following commands:
    ```bash
    git add .
    git commit -m "Update content"
    git push origin main
6. Update your GitHub repository setting for deploying to GitHub Pages.
   1. Navigate to the Settings > Pages section on GitHub for that repository and set the source to `Deploy from a branch` and the branch to `gh-pages` and `/(root)`.

<box type="important" light>

**Checkpoint**

Check that the following are true:
- [ ] The triggered GitHub action runs are successful
- [ ] The site is deployed and available at `https://<username>.github.io/mb-dev-xxx/` (after a few seconds to a few minutes)

Congratulations! :tada::tada::tada: You have deployed your MarkBind site!
</box>

## Summary

In the first part of this bootcamp, we experimented with MarkBind as a user. We have set up the master branch MarkBind and created a new MarkBind site. We have also created content with MarkBind components/syntax and deployed our site.

<box type="tip" seamless>

You can refer to the example repository [here](https://github.com/tlylt/mb-dev-tlylt) for the expected content of the site.
</box>

Here are some additional tasks for you to try out:
- [ ] Create a new MarkBind site with a different [theme]({{baseUrl}}/userGuide/themes.html)
- [ ] Try out MarkBind's [include mechanism]({{baseUrl}}/userGuide/reusingContents.html#includes)
- [ ] Create a dedicated MarkBind site for your personal usage and [share it with us](https://github.com/MarkBind/markbind/discussions/new?category=show-and-tell)
  - You can see some examples in the [MarkBind showcase]({{baseUrl}}/showcase.html)

Take a break now :coffee: and we will continue with the second part of the bootcamp!

{% from "njk/common.njk" import previous_next %}
{{ previous_next('intro', 'contributeToDocs') }}
