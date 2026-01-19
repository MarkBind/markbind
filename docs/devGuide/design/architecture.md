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
  graph TD
    %% --- Node Styling ---
    classDef default fill:#e1ecf4,stroke:#8fbbe4,stroke-width:2px;
    classDef header fill:#dae8fc,stroke:#6c8ebf,font-size:16px;
    classDef process fill:#e1ecf4,stroke:#b0c4de,text-align:left;
    classDef title fill:#6fa8dc,stroke:none,color:white,font-weight:bold;

    %% --- 1. Top Level Structure ---
    CLI[index.js #40;cli#41;]
    Site[Site]

    %% --- 2. Left Column Components ---
    Page[Page]
    
    LM[LayoutManager<br/><sub>Manages, generates,<br/>and provides layouts</sub>]
    Layout[Layout]
    
    EM[ExternalManager<br/><sub>Manages, generates<br/>Externals</sub>]
    External[External]

    %% --- 3. Right Column: Content Processing Subgraph ---
    subgraph CPF [Content Processing Flow]
        direction TB
        %% This invisible node helps force layout width
        style CPF fill:#fff,stroke:#3366CC,stroke-width:2px

        VP[<b>1. VariableProcessor</b><br/>• Manages site variables<br/>• Manages #40;sub#41;site Nunjucks environments, facilitates Nunjucks calls]:::process
        
        NP[<b>2. NodeProcessor</b><br/>• Manages Markdown, HTML<br/>processing state for a Page, Layout or External]:::process
        
        MP[<b>2.1 Markdown Processing</b><br/>#40;core/lib/markdown-it#41;]:::process
        
        HEP[<b>2.2 Html element processing</b><br/>• Render markdown-in-attributes to vue slots<br/>• Flag Externals for generation in<br/>ExternalManager #40;e.g. &lt;panel src='...''&gt;#41;<br/>• Link processing<br/>• Other misc. operations]:::process
    end

    %% --- 4. The Legend (Optional Hack to display legend) ---
    subgraph LegendBox [Legend]
        L1[contains] --- L2[> ] 
        L3[uses] --- L4[> ]
        style LegendBox fill:#fff,stroke:#000
        style L1 fill:#fff,stroke:none
        style L2 fill:#fff,stroke:none,color:#3366CC
        style L3 fill:#fff,stroke:none
        style L4 fill:#fff,stroke:none,color:#F28522
        
        linkStyle 0 stroke:#3366CC,stroke-width:2px;
        linkStyle 1 stroke:#F28522,stroke-width:2px;
    end

    %% --- DEFINING RELATIONSHIPS (Order matters for linkStyle) ---
    
    %% GROUP 1: BLUE ARROWS (CONTAINS)
    %% Indices 2 - 8
    CLI -- 1 --> Site
    Site -- * --> Page
    Site -- 1 --> LM
    Site -- 1 --> EM
    LM -- * --> Layout
    EM -- * --> External
    Site -- 1 --> VP

    %% GROUP 2: ORANGE ARROWS (USES)
    %% Indices 9 - 14
    Page --> LM
    Page --> EM
    LM --> EM
    Page --> VP
    Layout --> VP
    External --> VP

    %% GROUP 3: GREEN ARROWS (FLOW)
    %% Indices 15 - 18
    VP --> NP
    NP --> MP
    MP --> HEP
    HEP -- Process &lt;include&gt; recursively --> VP

    %% --- Apply Styles to Links ---
    
    %% Blue Arrows (Contains)
    linkStyle 2,3,4,5,6,7,8 stroke:#3366CC,stroke-width:2px;
    
    %% Orange Arrows (Uses)
    linkStyle 9,10,11,12,13,14 stroke:#F28522,stroke-width:2px;

    %% Green Arrows (Process Flow)
    linkStyle 15,16,17,18 stroke:#93C47D,stroke-width:2pxd;

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
