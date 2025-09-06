<frontmatter title="Mermaid Flowchart" />

# Mermaid Rendering Test

<box type="info">
This page demonstrates if &lt;mermaid&gt; blocks are correctly converted and rendered.
</box>

<mermaid>
flowchart TD
  A[Start] --> B{Is it?}
  B -->|Yes| C[OK]
  C --> D[Rethink]
  D --> B
  B ---->|No| E[End]
</mermaid>
