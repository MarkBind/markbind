## Badges

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
Normal:
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-light">Light</span>
<span class="badge badge-dark">Dark</span>
<br>Pills:
<span class="badge badge-pill badge-primary">Primary</span>
<span class="badge badge-pill badge-secondary">Secondary</span>
<span class="badge badge-pill badge-success">Success</span>
<span class="badge badge-pill badge-danger">Danger</span>
<span class="badge badge-pill badge-warning">Warning</span>
<span class="badge badge-pill badge-info">Info</span>
<span class="badge badge-pill badge-light">Light</span>
<span class="badge badge-pill badge-dark">Dark</span>
</variable>
</include>

You can use Badges in combination with headings, buttons, links, etc.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
Links:
<a href="#" class="badge badge-primary">Primary</a>
<a href="#" class="badge badge-pill badge-warning">Warning</a>

Buttons:
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge badge-light">4</span>
</button>

Headings:

### Feature X <span class="badge badge-danger">beta</span> {.no-index}
##### Feature Y <span class="badge badge-pill badge-success">stable</span> {.no-index}
</variable>
</include>


<div class="indented">

%%{{ icon_info }} You can refer to [Bootstrap documentation](https://getbootstrap.com/docs/4.2/components/badge/) to find more information about Badges.%%
</div>


<span id="short" class="d-none">

```markdown
<span class="badge badge-primary">Primary</span>
<span class="badge badge-pill badge-success">Success</span>
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge badge-light">4</span>
</button>
```
</span>

<span id="examples" class="d-none">

<span class="badge badge-primary">Primary</span>
<span class="badge badge-pill badge-success">Success</span>
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge badge-light">4</span>
##### Feature Y <span class="badge badge-pill badge-warning">stable</span> {.no-index}
</button>
</span>
