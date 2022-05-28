### Plugin: MathDelimiters 

This plugin allows you to use additional delimiters for your math formulae. Availble delimiters are listed in [the markdown-it-texmath package](https://github.com/goessner/markdown-it-texmath#features).

These delimiters are supported without guarentee that they will be rendered correctly, especially when they happen to conflict with
other MarkBind syntax.

<box type="info">

Note that the **!!default delimiters still function as expected!!**, this plugin simply adds the additional delimiters.

</box>

To enable this plugin, add `mathDelimiters` to your site's plugins and specify the delimters in the context.

```js {heading="site.json"}
{
  ...
  "plugins": [
    "mathDelimiters"
  ],
  "pluginsContext" : {
    "mathDelimiters" : {
      "delimiters": ["beg_end"]
    }
  },
}
```

{{ icon_example }} with `beg_end` delimiters:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
\begin{equation}
  a^2+b^2=c^2
\end{equation}

\begin{equation}
  \begin{pmatrix}
    A & B \\ B & C
  \end{pmatrix}
\end{equation}

</variable>
</include>
