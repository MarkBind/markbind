## Keywords
<span class="keyword d-none">regress</span>
<span class="keyword d-none">regression testing</span>

**You can also specify additional keywords to be indexed under a heading** by tagging the words with the `keyword` class. Those keywords will be linked to the heading immediately above it. If you want to index a keyword without rendering it in the page, add `d-none` as a class.

<div class="indented">

{{ icon_example }}

```html
#### Developer Testing
<span class="keyword d-none">regress</span>
<span class="keyword d-none">regression testing</span>

This is good for catching <span class="keyword">regressions</span>.
```
{{ icon_arrow_down }}

<box>

<big>**Developer Testing**</big><br>

This is good for catching <span class="keyword">regressions</span>.
</box>
</div>

**You can also set additional keywords to be indexed for an entire page** using the `keywords` attribute inside the `<frontmatter>` of that page.

<div class="indented">

{{ icon_example }}

```html
<frontmatter>
  keywords: regress, regression testing, regressions
</frontmatter>
...
```
</div>

<span id="short" class="d-none">

```html
<span class="keyword d-none">regress</span>
```
</span>
