## Badges

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
Normal:
<span class="badge bg-primary">Primary</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-warning text-dark">Warning</span>
<span class="badge bg-info text-dark">Info</span>
<span class="badge bg-light text-dark">Light</span>
<span class="badge bg-dark">Dark</span>
<br>Pills:
<span class="badge rounded-pill bg-primary">Primary</span>
<span class="badge rounded-pill bg-secondary">Secondary</span>
<span class="badge rounded-pill bg-success">Success</span>
<span class="badge rounded-pill bg-danger">Danger</span>
<span class="badge rounded-pill bg-warning text-dark">Warning</span>
<span class="badge rounded-pill bg-info text-dark">Info</span>
<span class="badge rounded-pill bg-light text-dark">Light</span>
<span class="badge rounded-pill bg-dark">Dark</span>
</variable>
</include>

You can use Badges in combination with headings, buttons, links, etc.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
Links:
<a href="#" class="badge bg-primary">Primary</a>
<a href="#" class="badge rounded-pill bg-warning text-dark">Warning</a>

Buttons:
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge bg-light text-dark">4</span>
</button>

Headings:

### Feature X <span class="badge bg-danger">beta</span> {.no-index}
##### Feature Y <span class="badge rounded-pill bg-success">stable</span> {.no-index}
</variable>
</include>


<div class="indented">

%%{{ icon_info }} You can refer to [Bootstrap documentation](https://getbootstrap.com/docs/5.1/components/badge/) to find more information about Badges.%%
</div>


<div id="short" class="d-none">

```markdown
<span class="badge bg-primary">Primary</span>
<span class="badge rounded-pill bg-success">Success</span>
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge bg-light text-dark">4</span>
</button>
```
</div>

<div id="examples" class="d-none">

<span class="badge bg-primary">Primary</span>
<span class="badge rounded-pill bg-success">Success</span>
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge bg-light text-dark">4</span>
##### Feature Y <span class="badge rounded-pill bg-warning text-dark">stable</span> {.no-index}
</button>
</div>
