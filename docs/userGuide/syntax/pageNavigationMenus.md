## Page Navigation Menus

<span class="keyword d-none">print page nav as table of content</span>

<div id="content">

**A _Page Navigation Menu_ (==_pageNav_ for short==)  a list of the current page's headings.** Page navigation menus are only available for use in [layouts]({{baseUrl}}/userGuide/tweakingThePageStructure.html#layouts).

****Adding a pageNav****

1. **Specify the smallest heading level you want to be included** within the `<frontmatter>` of a page with <tooltip content="The value `default` will use `headingIndexingLevel` within `site.json`.">`"default"`</tooltip> or a <tooltip content="HTML defines six levels of headings, numbered from <br>`1 to 6`.">`heading level`</tooltip>.

   <box type="info" seamless>

   The `default` level uses the [`headingIndexingLevel` property]({{baseUrl}}/userGuide/siteJsonFile.html#headingindexinglevel) of your site configuration file.
   </box>

2. **(Optional) You may also specify a page navigation title** within `<frontmatter>` that will be placed at the top of the page navigation menu.

3. **Position the page navigation menu** within your layout using the `<page-nav />` component.

4. **(Optional) To make pageNav accessible on smaller screens, you can use the `<page-nav-button />` component in the [navbar]({{baseUrl}}/userGuide/components/navigation.html#navbars).**

5. **(Optional) To make pageNav available on print, you can position the page navigation menu on individual pages with the `<page-nav-print />` component.**

<panel header="**Additional details on printing pageNav**" type="seamless" class="ms-4" expanded>

You can specify the location of the page navigation menu on print by using either of the following syntaxes:
- `<page-nav-print />`
- `<page-nav-print></page-nav-print>`
  - This is useful if you want to include a custom title (or any other content) before the page navigation menu. For example, `<page-nav-print>Table of Contents</page-nav-print>`

You can specify multiple `<page-nav-print />` components in a page and they do not have to be at the top of the page. They also do not appear when viewed on a browser.

{{ icon_example }}
In the page that you want to have page navigation printed (i.e. to serve as a table of content when viewed on PDFs), use the `<page-nav-print />` component to position the pageNav like so:

<div id="short" class="indented">

```html
<frontmatter>
  pageNav: 2
  pageNavTitle: "Chapters of This Page"
</frontmatter>

<page-nav-print />

# Overview
Content of the page...
```

</div>

To view the pageNav on print, open the print preview of the page using the browser's print function.

<box type="info" seamless>

If you are using Chrome, you can right-click on the page and select "Print" to open the print preview.
You can try it out by going to our [CLI Commands page]({{baseUrl}}/userGuide/cliCommands.html) and printing it.
</box>

</panel>

</div>

<div id="examples" class="d-none">

You can see an example of a Page Navigation Bar ==on the right side== of <a target="_blank" href="{{ baseUrl }}/userGuide/formattingContents.html">this page</a>.
</div>
