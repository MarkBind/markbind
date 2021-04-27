{% set title = "Architecture" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead mb-5">

This page provides an overview of the MarkBind's architecture.
</div>

![MarkBind Architecture Diagram](<{{baseUrl}}/images/dev diagrams/architecture.png>)

The above diagram shows the key classes and <popover content="The content processing flow acts on a **single** source file (`.md` / `.mbd` / `.html`), generating output files or intermediate processing results depending on the content type.">content processing flow</popover> in MarkBind. You may note the following from these:

### Key classes

The 3 key classes representing different types of content are as follows:
1. `Page` — a page, as specified by the user in their various site configuration `glob` or `src` properties. These are directly managed by the `Site` instance.
1. `Layout` — a single layout file, as contained in the `_markbind/layouts` folder, collectively managed by `LayoutManager`.
   
    <box type="tip" seamless>Note that `Layout` instances do not generate any output files directly, but rather, they store intermediate processing results to be used in a `Page`.</box>
1. `External` — source files referenced in a `Page`, `Layout` or even another `External` that result in a <tooltip content="hence the class naming `External`">**separate**</tooltip> output file. These output files are loaded dynamically and on-demand in the browser. These instances are managed by a single `ExternalManager` instance.

<box type="info" seamless>

For example, the file referenced by a `<panel src="xx.md">` generates a separate `xx._include_.html`, which is requested and loaded only when the panel is expanded.
</box>

### Content processing flow

Every `Page`, `Layout` and `External` follows the same overall content processing flow, that is:

_Nunjucks :fas-arrow-right: Markdown :fas-arrow-right: Html_

<box type="info" seamless>

Note that generation of `External`s (e.g. `<panel src="...">`) **do not fall within** the content processing flow !!where they are **referenced**!!.
These are only flagged for generation, and then processed by `ExternalManager` **after**, in **another** similar content processing flow within an `External` instance.
</box>

****Rationale****

This simple three stage flow provides a simple, predictable content processing flow for the user, and removes several other development concerns:

1. As the templating language of choice, Nunjucks is always processed first, allowing its templating capabilities to be used to the full extent.
Its syntax is also the most compatible and independent of the other stages.

2. Secondly, Markdown is **rendered before html**, which produces more html. This also allows core Markdown features (e.g. code blocks) and Markdown plugins with eccentric syntaxes to be used without having to patch the html parser.

3. Having processed possibly conflicting Nunjucks and Markdown syntax, Html is then processed last.
