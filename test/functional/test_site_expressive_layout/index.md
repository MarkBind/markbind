<frontmatter>
  footer: footer.md
</frontmatter>

<variable name="mainVar">Variable from page</variable>

---
*Content above the horizontal line belongs to the layout file*

# Welcome to Markbind

This is a minimalistic template. To learn more about authoring contents in Markbind, visit the [User Guide](https://markbind.org/userGuide/authoringContents.html).

{{ mainVar }}

{% raw %}
**Test that {% raw %} and {% endraw %} tags work in the content file inserted into the layout**
{% endraw %}

*Content below the horizontal line belongs to the layout file*

---