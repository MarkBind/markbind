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

## Archiving with a CLI command

Markbind allows you to easily save a version of the site you've built to be hosted at the same site with a modified URL with a [single CLI command](cliCommands.md#archive-command). All intralinks within the archived site will point to the respective archived pages. By default, the archived site is stored in a folder `version/<versionName>`, but you may specify your own archivePath.

For example, if your site's base URL relative to your domain is `my_site`, and you archive a version named `v1` in the default archive folder, then by navigating to the URL `<domain>/my_site/version/v1/<someFile>` you can have accessed the archived version of `someFile`.

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

You may not always want to build all your saved versions. To specify the "default versions to build", add a [versions property](siteJsonFile.md#versions) in your `site.json` file.

You may also specify which versions to build when using the build and serve cli commands([more information](cliCommands.md)).

## Note on subsites

At present, when a site is archived and includes a subsite, it archives the subsite as it was at that point in time. Navigating to previous or future versions of the subsite from the parent site is not supported, though you can archive the subsite.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('deployingTheSite', 'markBindInTheProjectWorkflow') }}
