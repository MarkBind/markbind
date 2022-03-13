## Math Formulae
Markbind supports typesetting TeX math equations. [KaTeX](https://katex.org) is used as a fast math renderer.

Insert **inline** equations by enclosing them in round brackets `\( ... \)`.

Insert **display** equations by enclosing them in square brackets `\[ ... \]`.

Insert numbered **display** equations by enclosing the equation square brackets and the equation number in curly brackets `\[ ... \] (1)`.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \( e^{i\pi}+1=0 \) is a beautiful equation.

</variable>
</include>


<box type="important">

If your equation requires special Nunjucks tags like {% raw %}`{{`{% endraw %} or {% raw %}`}}`{% endraw %},use a
[raw-endraw block](https://markbind.org/userGuide/tipsAndTricks.html#using-raw-endraw-to-display-content):

```markdown
{% raw %}{% raw %}\(e^{{\frac{1}{3}} + 1}\){% endraw %}{% endraw %}
```

</box>

<small>More info on allowed symbols: https://katex.org/docs/support_table.html</small>

<span id="short" class="d-none">

```markdown

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \( e^{i\pi}+1=0 \) is a beautiful equation.

```
</span>
<span id="examples" class="d-none">

Solve the following simultaneous equations:

\[ 3x + y = 11 \] (1)

\[\frac{2x}{3} + \frac{2y}{3} = 8\] (2)

Euler's equation \( e^{i\pi}+1=0 \) is a beautiful equation.

</span>
