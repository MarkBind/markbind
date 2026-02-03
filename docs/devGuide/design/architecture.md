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

<mermaid>
graph LR
    %% --- Styling ---
    classDef entry fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;
    classDef core fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    classDef process fill:#e1f5fe,stroke:#4a90e2,stroke-width:2px;
    classDef manager fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef vue fill:#f3e5f5,stroke:#b266b3,stroke-width:2px;
    classDef output fill:#fff2cc,stroke:#d6b656,stroke-width:2px;

    %% --- 1. Entry Point ---
    CLI["index.js <br/>CLI Entry"]:::entry

    %% --- 2. Core Architecture ---
    subgraph Core [Core Site Architecture]
        direction TB
        Site["Site<br/>Orchestrates Build"]:::core
        Page["Page<br/>Per-File Processing"]:::core
    end

    %% --- 3. Resource Managers ---
    subgraph Managers [Resource Managers]
        direction TB
        LM["LayoutManager<br/>&bull; Generate layouts<br/>&bull; Combine with page"]:::manager
        EM["ExternalManager<br/>&bull; Generate dependencies<br/>&bull; Copy assets"]:::manager
    end

    %% --- 4. Content Processing Pipeline ---
    subgraph Pipeline [Content Processing Pipeline]
        direction TB

        VP["VariableProcessor<br/>Nunjucks Templates"]:::process

        subgraph NodeProcessing [Node Processing]
            direction TB
            NP["NodeProcessor<br/>DOM Traversal"]:::process
            MP["Markdown Processing<br/>markdown-it instance"]:::process
            Note["Traverses DOM &amp;<br/>renders markdown attributes into vue slots using markdown-it"]:::process
            HP["HTML element processing<br/>&bull; Link processing<br/>&bull; Flags externals for generation<br/>in ExternalManager"]:::process
        end

        Layout["Apply Layout<br/>LayoutManager.combine"]:::process
    end

    %% --- 5. Vue Rendering Layer ---
    subgraph VueLayer [Vue Rendering Layer]
        direction TB
        VueCompile["PageVueServerRenderer<br/>1. compileTemplate()<br/>2. save .page-vue-render.js"]:::vue
        SSR["renderVuePage()<br/>Server-Side Render"]:::vue
        Template["Template Rendering<br/>page.njk"]:::vue
    end

    %% --- 6. Output & Client ---
    subgraph Output [Output & Client]
        direction TB
        HTML["Static HTML File"]:::output
        Hydrate["Client Hydration<br/>createSSRApp().mount()"]:::output
        VueComponents["@markbind/vue-components<br/>Interactive Components"]:::output
    end

    %% --- RELATIONSHIPS ---
    CLI --> Site
    Site --> Page
    Page -. "uses" .-> LM
    Page -. "uses" .-> EM
    LM -. "uses" .-> EM

    Page --> VP
    VP --> NP
    NP --> Layout
    Layout --> VueCompile
    EM --> VueCompile

    NP -. "uses" .-> MP
    MP -.-> HP
    HP -.-> Note
    VueCompile --> SSR
    SSR --> Template
    Template --> HTML

    HTML --> Hydrate
    Hydrate --> VueComponents

    Note -. "recursive" .-> VP

    %% Styling Links
    linkStyle 0,1 stroke:#3366CC,stroke-width:3px
    linkStyle 2,3,4 stroke:#F28522,stroke-width:2px,stroke-dasharray: 5 5
    linkStyle 5,6,7,8,9 stroke:#2D882D,stroke-width:3px
    linkStyle 10,11,12 stroke:#b266b3,stroke-width:2px,stroke-dasharray: 5 5
    linkStyle 13,14,15 stroke:#b266b3,stroke-width:3px
    linkStyle 16 stroke:#d6b656,stroke-width:3px
    linkStyle 17,18 stroke:#82b366,stroke-width:2px

</mermaid>

The above diagram shows the key classes and <popover content="The content processing flow acts on a **single** source file (`.md` / `.html`), generating output files or intermediate processing results depending on the content type.">content processing flow</popover> in MarkBind. You may note the following from these:

### Key classes

The 3 key classes representing different types of content are as follows:

1. `Page` — a page, as specified by the user in their various site configuration `glob` or `src` properties. These are directly managed by the `Site` instance.
1. `Layout` — a single layout file, as contained in the `_markbind/layouts` folder, collectively managed by `LayoutManager`.

<box type="tip" seamless>

Note that `Layout` instances do not generate any output files directly, but rather, they store intermediate processing results to be used in a `Page`.
</box>

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

2. Secondly, Markdown is **rendered before HTML**, which produces more HTML. This also allows core Markdown features (e.g. code blocks) and Markdown plugins with eccentric syntaxes to be used without having to patch the HTML parser.

3. Having processed possibly conflicting Nunjucks and Markdown syntax, HTML is then processed last.

### Demonstrating the content processing flow
To demonstrate the content processing flow, let's take a look at a small toy MarkBind file:
```markdown
{% raw %}{% set myVariable = "Item" %}

# A basic level 1 header
There will be 5 items here:
<ul>
{% for item in [1, 2, 3, 4] %}
   <li>{{ myVariable }} #{{ item }}</li>
{% endfor %}
</ul>

A link that gets [converted](contents/topic1.md)

<include src="contents/topic1.md" />{% endraw %}
```

At the first step of the processing flow, the `VariableProcessor` converts Nunjucks template code into HTML:
```markdown
{% raw %}# A basic level 1 header
There will be 5 items here:
<ul>
   <li>Item #1</li>
   <li>Item #2</li>
   <li>Item #3</li>
   <li>Item #4</li>
</ul>

A link that gets [converted](contents/topic1.md)

<include src="contents/topic1.md" />{% endraw %}
```
Notice that `myVariable` is consumed and that the unordered list is expanded.

Next, the NodeProcessor converts Markdown to HTML:
```markdown
{% raw %}<h1 id="a-basic-level-1-header">A basic level 1 header<a class="fa fa-anchor" href="#a-basic-level-1-header" onclick="event.stopPropagation()"></a></h1>
<p>There will be 5 items here:</p>
<ul>
   <li>Item #1</li>
   <li>Item #2</li>
   <li>Item #3</li>
   <li>Item #4</li></ul>
<p>A link that gets <a href="/contents/topic1.html">converted</a></p>
<div>
<br>
<h1 id="topic-1">Topic 1<a class="fa fa-anchor" href="#topic-1" onclick="event.stopPropagation()"></a></h1>
<blockquote>
<p>This is a placeholder page - more content to be added.</p></blockquote></div>{% endraw %}
```
It does this by traversing the node graph and matching node titles to their HTML equivalents. This includes custom components as well (e.g. `<panel .. />`).
`include` nodes are recursively traversed and converted.

In the final step, the processed content is injected into the page layout and the final output `.html` file is generated.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('projectStructure', 'serverSideRendering') }}
