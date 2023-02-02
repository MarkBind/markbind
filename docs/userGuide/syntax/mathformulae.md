## Math Formulae
MarkBind supports typesetting TeX math equations. [KaTeX](https://katex.org) is used as a fast math renderer.

Two types of delimiters are supported and can be used interchangeably:

* `'dollars'`
  * Insert **inline** equations by enclosing them in `$...$` or `$$...$$`
  * Insert **display** equations by enclosing them in `$$...$$`
  * Insert **display** + **equation number**: `$$...$$ (1)`
* `'brackets'`
  * Insert **inline** equations by enclosing them in `\(...\)`
  * Insert **display** equations by enclosing them in `\[...\]`
  * Insert **display** + **equation number**: `\[...\] (1)`

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \(e^{i\pi}+1=0\) is a beautiful equation.

$$ 4x + 5y = 16 $$ (3)

$$\frac{10x}{3} + \frac{5y}{3} = 8$$ (4)

Finally, the Pythagoras theorem: $c^2 = a^2 + b^2$.

</variable>
</include>

Additional delimiters are possible by enabling the [mathDelimiters](../usingPlugins.md#plugin-mathdelimiters) plugin.

<box type="info">

If your equation requires special Nunjucks tags like {% raw %}`{{`{% endraw %} or {% raw %}`}}`{% endraw %},use a
[raw-endraw block](https://markbind.org/userGuide/tipsAndTricks.html#using-raw-endraw-to-display-content):

```markdown
{% raw %}{% raw %}\(e^{{\frac{1}{3}} + 1}\){% endraw %}{% endraw %}
```

</box>

<small>More info on allowed symbols: https://katex.org/docs/support_table.html</small>

<div id="short" class="d-none">

```markdown

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \( e^{i\pi}+1=0 \) is a beautiful equation.

```
</div>
<div id="examples" class="d-none">

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \( e^{i\pi}+1=0 \) is a beautiful equation.

</div>
