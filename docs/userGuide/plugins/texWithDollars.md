### Plugin: TexWithDollars 

This plugin allows you to use <tooltip content="$ ... $ or $$ ... $$">dollars</tooltip> as the delimiter for your math formulae.

- Insert **inline** equations by enclosing them in single dollars `$...$`.

- Insert **display** equations by enclosing them in double dollars `$$...$$`.

- Insert numbered **display** equations by enclosing the equation in double dollars and the equation number in curly brackets `$$...$$ (1)`.

<box type="info">

Note that the **!!default delimiters still function as expected!!**, this plugin simply adds an additional delimiter. 

</box>

To enable this plugin, add `texWithDollars` to your site's plugins.  

```js {heading="site.json"}
{
  ...
  "plugins": [
    "texWithDollars"
  ]
}
```

{{ icon_example }} Example:

```markdown
$2_3$

$$
\frac{1}{2}
$$
```
The above will be rendered as:
\(2_3\)

\[ \frac{1}{2} \]
