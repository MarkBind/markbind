{% set title = "Adding Pages" %}
{% set filename = "addingPages" %}
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

**It is easy to add files to a MarkBind site as any file inside the {{ tooltip_root_directory }} becomes a part of the generated website.**

</div>

This includes any static assets such as images and other media files.

<div class="indented">

{{ icon_example }} If you have an image `images/logo.png` in your root directory, it will be available as `<website-url>/images/logo.png` in the generated website.

</div>

<div class="indented">

{{ icon_example }} If you have a file `tutorial/code.txt` in your root directory, it will be available as `<website-url>/tutorial/code.txt` in the generated website.

</div>

%%You can specify which files to be omitted from the site by using the `ignore` field in the `site.config` file as explained [here](siteJsonFile.html#ignore).%%

**More importantly, `.md` files can be transformed into HTML pages with matching names.**

<div class="indented">

{{ icon_example }} `<root>/tutorial/`**`setup.md`** can be transformed into `<website-url>/tutorial/`**`setup.html`**

</div>

Here are the steps to add a new page to your site:
1. Add a `.md` file anywhere inside the root directory.
2. Update the [`pages` attribute of the `site.json`](siteJsonFile.html#pages) to cover the new file, if necessary.
3. Use the <trigger trigger="click" for="modal:addingPages-livePreview">live preview</trigger> to view the generated web page for the new file.

<modal large header="Live Preview" id="modal:addingPages-livePreview">
<include src="glossary.md#live-preview"/>
</modal>

## External Static HTML Web Pages

You can easily include and deploy any external <tooltip content="For example, `.html` files that are built using other tools">HTML web pages</tooltip>, along with your MarkBind site.

<div class="indented">

{{ icon_example }} Your code coverage tool generates a HTML Coverage Report into a `coverage` folder and you want it to be accessible at `<website-url>/coverage/index.html`

</div>

The general approach is as follows:

1. Create a folder with the path that you want the HTML web page to be available at.
1. Exclude the files from being further processed by MarkBind by adding them to the <trigger trigger="click" for="modal:addingPages-prevent-processing">`pagesExclude` attribute of the `site.json` file</trigger>.
1. Generate the HTML files and put them in that folder (This can be done automatically by your build tool, either locally, or as part of your continuous integration process).
1. (Optional) Run `markbind build` to generate your MarkBind site.
1. Deploy the built files manually or using a continuous integration process.

<box type="tip">

In the event that you only generate the static webpages in your CI build process, you may receive an invalid intra-link warning if you serve the MarkBind site locally. To disable it on a per-link basis, add `{no-validation}` at the end like this:

```md
This is [my cool page generated from another tool](/my-cool-page/index.html{no-validation})
```

 See the [link Validation section](formattingContents.html#intra-site-links) for more details.
</box>

<modal large header="Prevent Further Processing" id="modal:addingPages-prevent-processing">

To prevent MarkBind from further processing any of the static assets (in the event that these files are generated from other tools or already processed), you can include

```json
"pagesExclude": ["yourStaticFolder/*"]
```

in your `site.json` file. See the [`pagesExclude` attribute](siteJsonFile.html#pagesexclude) for more details. Alternatively, you can configure the [`pages` attribute](siteJsonFile.html#pages) accordingly.

</modal>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('authoringContents', 'markBindSyntaxOverview') }}
