<frontmatter>
  title: "PageNav Test"
  pageNavTitle: {% raw %} "Title interpolation {{ test }}" {% endraw %}
  pageNav: 5
</frontmatter>

{% raw %}

##### The pageNavTitle should correctly show the raw variable syntax

The pageNavTitle should be rendered as:

```html
<a class="navbar-brand page-nav-title" href="#" data-v-e8c82f88="">
  Title interpolation {{ test }}
</a>
```
{% endraw %}

{% raw %}

##### :fas-lightbulb: Using {% raw %}{% endraw %} to display `{{ content }}`

The above heading should be rendered as:

```html
<a class="nav-link py-1 active" href="#using-raw-endraw-to-display-content" data-v-e8c82f88="">
    Using {% raw %}{% endraw %} to display {{ content }}&lrm;
</a>
```

{% endraw %}
