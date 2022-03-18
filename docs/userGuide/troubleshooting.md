{% set title = "Troubleshooting" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title | safe }}"
  layout: userGuide.md
  pageNav: 5
</frontmatter>

# {{ title | safe }}

##### HTML Rendering Issues

Unexpected behavior can occur in rendered pages due to a number of different reasons. One of these reason is when the rendered pages are not valid HTML.

Incorrect HTML markup can be due to:
- nesting block-level elements inside `<p>` or `<span>` elements
- missing `<tbody>` tags

###### Example: block-level elements inside `<span>` elements
```html

<span id="example">

Animal | Trainable? | Price | Remarks
:------|:----------:|------:|--------
Ants   |     no     |     5 |
Bees   |     no     |    20 |
Cats   |    yes     |   100 |
</span>
```

The table specified by the markdown syntax above will be rendered as a block-level element, which will be included in a inline span element. This makes the HTML output invalid. A possible fix for the above situation is to wrap the table in a `<div>` element instead.

<panel header="Example Underlying Error" type="seamless">

vue.js:634 [Vue warn]: The client-side rendered virtual DOM tree is not matching server-rendered content. This is likely caused by incorrect HTML markup, for example nesting block-level elements inside `<p>`, or missing `<tbody>`. Bailing hydration and performing full client-side render.
</panel>
