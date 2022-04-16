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

Markbind allows you to easily save a version of the site you've built to be hosted at the same site with a modified URL with a [single CLI command](cliCommands.md#archive-command). All intralinks within the archived site will point to the respective archived pages. By default, the archive folder is called `version`, but you may specify your own directory.

For example, if your site's base URL relative to your domain is `my_site`, and you archive a version named `v1` in the default archive folder, then by navigating to the URL `<domain>/my_site/version/v1/<someFile>` you would have accessed the archived version of `someFile`.

A `versions.json` file will be created to track the archived sites you have made, and to exclude the archived sites from being re-archived the next time you make a new version. Modify it with caution, as it may result in unnecessary files being included or necessary files being excluded.

```json {heading="Example of a versions.json file"}
{
  "versions": [
    {
      "version_name": "v1",
      "build_ver": "3.1.1",
      "output": "v1"
    },
    {
      "version_name": "v2",
      "build_ver": "3.1.1",
      "output": "v2"
    },
    {
      "version_name": "v3",
      "build_ver": "3.1.1",
      "output": "v3"
    }
  ]
}
```

<include src="cliCommands.md#archiveWarning" />

{% from "njk/common.njk" import previous_next %}
{{ previous_next('deployingTheSite', 'markBindInTheProjectWorkflow') }}
