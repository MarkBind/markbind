{% set title = "Site Versioning" %}
{% set filename = "versioning" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

Site versioning is key for documentation use, and websites may want to keep past versions for archival purposes. MarkBind can help you easily archive your site.
</div>

## Quickstart

If you wanted to archive your site for the first time, you might use the following command.

  ```bash
  $ markbind archive v1 // archive the current site with the name v1 into the folder version/v1
  ```

Make whatever changes you want to your site without affecting this saved version. Then, run:

  ```bash
  $ markbind serve -v v1 // serve the site as well as the archived version named v1
  ```

Your served site will open automatically. By adding version/v1 to the url in your browser (for example from http://127.0.0.1:8080 to http://127.0.0.1:8080/version/v1), you will view the archived version of your site. Intralinks in the versioned site will only lead to the versioned site links. 

To deploy your site with your archived site:

  ```bash
  $ markbind build -v v1 // generate site with the archived version named v1
  $ markbind deploy
  ```

You can save which versions to automatically be served/deployed in [site.json](siteJsonFile.md#versions).

## More on archiving

MarkBind allows you to easily save a version of the site you've built to be hosted at the same site with a modified URL using a [single CLI command](cliCommands.md#archive-command). All intralinks within the archived site will point to the respective archived pages. By default, the archived site is stored in a folder `version/<versionName>`, but you may specify your own archivePath.

For example, if your site's base URL relative to your domain is `my_site`, and you archive a version named `v1`, then by navigating to the URL `<domain>/my_site/version/v1/<someFile>` you can access the archived version of `someFile`.

A `versions.json` file will be created to track the archived sites you have made, and to exclude the archived sites from being re-archived the next time you make a new version. This file is **automatically updated** every time you archive a version.

<box type="warning">

Modify versions.json with caution as it may result in unnecessary files being included or necessary files being excluded.

* You may safely change the `versionName` of a version, **provided that it is unique** in versions.json. If you have specified versions to deploy in `site.json`, make sure you update the [versions property](siteJsonFile.md#versions) there as well.

* The baseUrl is used when setting the intra-site links; if you later change the baseUrl, previously saved versions with the past baseUrl will not be built/deployed even if specified because it would be a broken implementation.

</box>

```json {heading="Example of a versions.json file"}
{
  "versions": [
    {
      "versionName": "v1",
      "buildVer": "3.1.1",
      "archivePath": "version/v1",
      "baseUrl": "/previousUrl"
    },
    {
      "versionName": "v2",
      "buildVer": "3.1.1",
      "archivePath": "version/v2",
      "baseUrl": "/markbind"
    },
    {
      "versionName": "v3",
      "buildVer": "3.1.1",
      "archivePath": "version/v3",
      "baseUrl": "/markbind"
    }
  ]
}

```

<include src="cliCommands.md#archiveWarning" />

## Working with sites with multiple versions

You may not always want to build all your saved versions. To specify the default versions to build, add a [versions property](siteJsonFile.md#versions) in your `site.json` file.

You may also specify which versions to build when using the build and serve cli commands([more information](cliCommands.md)).

{% from "njk/common.njk" import previous_next %}
{{ previous_next('deployingTheSite', 'markBindInTheProjectWorkflow') }}
