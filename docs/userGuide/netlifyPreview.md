<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Previewing with Netlify

[Netlify](https://www.netlify.com/) is an automation platform for deploying static webpages, similar to GitHub Pages. This section documents how to setup Netlify to automatically deploy and preview your MarkBind site every time your MarkBind project is updated.

## Previewing site on Netlify with the latest version of MarkBind

1. Go to https://app.netlify.com/ and sign up
1. Next go to https://app.netlify.com/account/sites and select `New site from Git`
1. Select your git provider

   ![Create a new site]({{baseUrl}}/images/netlifyPreview1.png =600x)

1. Select your markbind site repository

   ![Select repository]({{baseUrl}}/images/netlifyPreview2.png =600x)

1. Update the build settings as follows:
   - Build Command: `npm i markbind-cli -g && markbind build --baseUrl`
   - Publish directory: `_site`

   ![Update build settings]({{baseUrl}}/images/netlifyPreview3.png =600x)

   and hit `Deploy site`.

Now your site will be deployed on Netlify at the given address specified after deployment.

Additionally when contributors make a pull request to `master`, you can preview the updated site at the bottom of the pull request by clicking on details:

![Preview deploy]({{baseUrl}}/images/netlifyPreview4.png =600x)

## Previewing site on Netlify with a specific version of MarkBind

In order preview a site on Netlify with a specific version of MarkBind, you need to do the following in the root directory of your site:

1. run `$ npm init` which will create `package.json` and `package.lock.json`
1. run `$ npm install markbind-cli@1.6.3 --save` to install markbind as a dependency (using v1.6.3 as an example)
1. create/update `.gitignore` file in the root directory and add:
    ```
    node_modules
    ```
1. update `ignore` in site.json to include
    - `node_modules/*`
    - `.gitignore`

Now you are ready to set up on Netlify

1. Go to https://app.netlify.com/ and sign up
1. Next go to https://app.netlify.com/account/sites and select `New site from Git`
1. Select your git provider

   ![Create a new site]({{baseUrl}}/images/netlifyPreview1.png =600x)

1. Select your markbind site repository

   ![Select repository]({{baseUrl}}/images/netlifyPreview2.png =600x)

1. Update the build settings as follows:
   - Build Command: `markbind build --baseUrl`
   - Publish directory: `_site`

   ![Update build settings]({{baseUrl}}/images/netlifyPreview3.png =600x)

Now your site will be deployed on Netlify at the given address specified after deployment.

Additionally when contributors make a pull request to `master`, you can preview the updated site at the bottom of the pull request by clicking on details:

![Preview deploy]({{baseUrl}}/images/netlifyPreview4.png)

</div>
