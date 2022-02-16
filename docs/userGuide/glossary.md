<frontmatter>
  title: "Glossary"
  layout: userGuide.md
</frontmatter>

#### Live Preview <span style="font-size: 0.8em;">:fas-sync:</span>

<span id="live-preview">

**_Live preview_** is:
- Regeneration of affected content upon any change to <tooltip content="`.md`, `.njk` files ... anything your content depends on!">source files</tooltip>, then reloading the updated site in the Browser.

- Regeneration will also occur upon any modification to attributes in `site.json` with the exception of [`baseUrl`](siteJsonFile.md#baseurl).

- Copying <tooltip content="files that don't affect page generation (eg. images), but are used in the site">assets</tooltip> to the site output folder.

Use [the `serve` command](cliCommands.html#serve-command) to launch a live preview.

</span>
