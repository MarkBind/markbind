{% set title = "Troubleshooting" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title | safe }}"
  layout: userGuide.md
  pageNav: 5
</frontmatter>

# {{ title | safe }}

##### HTML Rendering Issues

Unexpected behavior can occur in rendered pages due to a number of different reasons. One of these reasons is when the rendered pages are not valid HTML.

Incorrect HTML markup can be due to:

- nesting block-level elements inside `<p>` or `<span>` elements
- missing `<tbody>` tags

###### Example: block-level elements inside `<span>` elements

```html
<span id="example">
  Animal | Trainable? | Price | Remarks :------|:----------:|------:|--------
  Ants | no | 5 | Bees | no | 20 | Cats | yes | 100 |
</span>
```

The table specified by the markdown syntax above will be rendered as a block-level element, which will be included in a inline span element. This makes the HTML output invalid.

<panel header="Underlying Error (Example)" type="seamless">

```
vue.js:634 [Vue warn]: The client-side rendered virtual DOM tree is not matching server-rendered content.
This is likely caused by incorrect HTML markup, for example nesting block-level elements inside `<p>`,
or missing `<tbody>`.
Bailing hydration and performing full client-side render.
```

See [SSR guide for Vue](https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch) for more details on hydration mismatch.
</panel>

A possible fix for the above situation is to wrap the table in a `<div>` element instead:

```html
<div id="example">
  Animal | Trainable? | Price | Remarks :------|:----------:|------:|--------
  Ants | no | 5 | Bees | no | 20 | Cats | yes | 100 |
</div>
```

##### Markdown Rendering Issues

If you encounter issues of failure in rendering markdown in a component, it is likely that the markdown is not being properly recognized due to syntax errors. Sign posting is required to inform markdown to parse content of a presentation component as markdown rather than plain text.

You could sign post markdown either by:

- using the `markdown` tag
- using an empty line without any indentation before the markdown content

<panel header="Markdown rendering (Example)" type="seamless">
Both using the `markdown` tag and adding line breaks will render the markdown content.Example:

```html
<box> <markdown> **Hello World** <markdown> </box>
```

and

```html
<box> 
  
**Hello World**
</box>
```
will render as:
<box> 
  
**Hello World** 
</box>
</panel>

<panel header="No markdown rendering (Example)" type="seamless">
If you do not sign post markdown, the content will be rendered as plain text.
Example:
  
  ```html
  <box> **Hello World** </box>
  ```
  will render as:
  <box> **Hello World** </box>
</panel>