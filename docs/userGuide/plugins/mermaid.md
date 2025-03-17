### Plugin: Mermaid

<div id="content">

This plugin allows you to utilize [Mermaid](https://mermaid-js.github.io/mermaid/) by automatically importing the library and initializing the rendering of the diagrams.

> Mermaid is a JavaScript based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically.

<box type="info">

All supported diagrams are available in [the Mermaid official documentation](https://mermaid-js.github.io/mermaid/). Here are some [examples](https://mermaid.js.org/syntax/examples.html) to quickly get started!

</box>

To enable this plugin, add `mermaid` to your site's plugins.

```js {heading="site.json"}
{
  ...
  "plugins": [
    "mermaid"
  ]
}
```

<panel header="Optional: Specify an alternative URL to load the Mermaid code">

By default, the plugin loads the Mermaid code from a CDN URL. However, you can optionally specify an alternative URL to load the Mermaid code from a different source.

```js {heading="site.json"}
{
  ...
  "plugins": [
    "mermaid"
  ],
  "pluginsContext": {
    "mermaid": {
      "address": "https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs" // replace with URL of your choice
    }
  }
}
```

</panel>

<br>

To create a Mermaid diagram, use the `<mermaid>` tag and provide the diagram definition within the tag. Usage of standard Mermaid syntax using the `<pre class="mermaid">` block directly in Markdown files is also supported for users who prefer to do so.

{{ icon_example }} Pie Chart:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<mermaid>
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
</mermaid>
<pre class="mermaid">
%%{init: {"pie": {"textPosition": 0.5}, "themeVariables": {"pieOuterStrokeWidth": "5px"}, 'theme': 'dark'} }%%
pie showData
    title Key elements in Product X
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  5
</pre>
</variable>
</include>

{{ icon_example }} Flowchart:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<mermaid>
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
</mermaid>
</variable>
</include>

{{ icon_example }} User Journey Diagram:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<mermaid>
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
</mermaid>
</variable>
</include>

{{ icon_example }} Gitgraph Diagram:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<mermaid>
gitGraph
    commit
    branch develop
    checkout develop
    commit
    checkout main
    merge develop
</mermaid>
</variable>
</include>

The plugin automatically converts the `<mermaid>` tags into appropriate `<pre>` elements for rendering the diagrams using the Mermaid library.

</div>
