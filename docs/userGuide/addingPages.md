<frontmatter>
  title: "User Guide: Adding Pages"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Adding Pages

<span class="lead" id="overview">

**It is easy to add files to a MarkBind site as any file inside the {{ tooltip_root_directory }} becomes a part of the generated website.**

</span>

<div class="indented">

{{ icon_example }} If you have a file `tutorial/code.txt` in your root directory, it will be available as `<website-url>/tutorial/code.txt` in the generated website.

</div>

%%You can specify which files to be omitted from the site by using the `ignore` field in the `site.config` file as explained [here]({{ baseUrl }}/userGuide/siteConfiguration.html#ignore).%%

**More importantly, `.md` and `.mbd` files can be transformed into html pages with matching names.**

<div class="indented">

{{ icon_example }} `<root>/tutorial/`**`setup.md`** can be transformed into `<website-url>/tutorial/`**`setup.html`**

</div>

Here are the steps to add a new page to your site:
1. Add a `.md` (or `.mbd`) file anywhere inside the root directory.
1. Update the [`pages` attribute of the `site.json`]({{ baseUrl }}/userGuide/siteConfiguration.html#pages) to cover the new file, if necessary.
1. Use the <trigger trigger="click" for="modal:addingPages-livePreview">live preview</trigger> to view the generated web page for the new file. <br> %%If the live preview is running already, you might have to restart it to capture the new file.%%

<modal large title="Live Preview" id="modal:addingPages-livePreview">
<include src="glossary.md#live-preview" inline/>
</modal>

</div>
