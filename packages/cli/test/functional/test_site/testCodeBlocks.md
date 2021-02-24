**Test: Code blocks**

**Normal fenced code should render correctly**

```
Content in a fenced code block
```

**With syntax coloring should render correctly**

```xml
<foo>
  <bar type="name">goo</bar>
</foo>
```

**`no-line-numbers` attr should hide corresponding line numbers**

```xml {.no-line-numbers}
<foo>
  <bar type="name">goo</bar>
</foo>
```

**`start-from` attr should set inline css in `<code>` tag, enabling lines to start from a specific line number**
```markdown {start-from=30}
*****
-----
```

**`highlight-lines` attr causes corresponding lines to have 'highlighted' class**
```markdown {highlight-lines="1,3,5-8"}
1  highlighted
2
3  highlighted
4
5  highlighted
6  highlighted
7  highlighted
8  highlighted
9
10
```

**`highlight-lines` attr with `start-from` attr should cause corresponding lines to have 'highlighted' class based on `start-from`**
```markdown {start-from=11 highlight-lines="11,13,15-18"}
11  highlighted
12
13  highlighted
14
15  highlighted
16  highlighted
17  highlighted
18  highlighted
19
20
```

**`highlight-lines` attr with empty (any variant) line-slice syntax should highlight leading/trailing spaces**
```xml {highlight-lines="2[:],3[::],4[:]-5[:]"}
<foo>
  <bar type="name">goo</bar>
  <baz type="name">goo</baz>
  <qux type="name">goo</qux>
  <quux type="name">goo</quux>
</foo>
```

**`highlight-lines` attr with full character-variant line-slice syntax should highlight only at specified range**
```xml {highlight-lines="1[1:4],2[5:13],3[2:10]-4,5-6[1:4]"}
<foo>
  <bar type="name">goo</bar>
  <baz type="name">goo</baz>
  <qux type="name">goo</qux>
  <quux type="name">goo</quux>
</foo>
```

**`highlight-lines` attr with partial character-variant line-slice syntax should defaults highlight to start/end of line**
```xml {highlight-lines="1[1:],2[:13],3[2:]-4,5-6[:2]"}
<foo>
  <bar type="name">goo</bar>
  <baz type="name">goo</baz>
  <qux type="name">goo</qux>
  <quux type="name">goo</quux>
</foo>
```

**`highlight-lines` attr with line-part syntax should highlight only at specified substring**
```xml {highlight-lines="2['type'],3['baz'],4['goo</qux>'],5['go\'o']"}
<foo>
  <bar type="name">goo</bar>
  <baz type="name">goo</baz>
  <qux type="name">goo</qux>
  <quux type="name">go'o</quux>
</foo>
```

**`highlight-lines` attr with full word-variant line-slice syntax should highlight only at specified word ranges**
```xml {highlight-lines="1[0::1],2[3::4],3[0::2],4[2::4],5[1::3]"}
<foo>
  <bar type="name"> goo </bar>
  <baz type="name"> goo </baz>
  <qux type="name"> goo </qux>
  <quux type="name"> goo </quux>
</foo>
```

**`highlight-lines` attr with partial word-variant line-slice syntax should defaults highlight to start/end of line**
```xml {highlight-lines="1[0::],2[3::],3[::2],4[2::],5[::3]"}
<foo>
  <bar type="name"> goo </bar>
  <baz type="name"> goo </baz>
  <qux type="name"> goo </qux>
  <quux type="name"> goo </quux>
</foo>
```

**Should render correctly with heading**

```{heading="A heading"}
<foo>
    <bar>
</foo>
```

**Inline markdown contained in heading should also be rendered correctly**

```{heading="**Bold**, _Italic_, ___Bold and Italic___, ~~Strike through~~, ****Super Bold****, $$Underline$$, ==Highlight==, ++Large++, --Small--, :+1: :exclamation: :x: :construction:<br>We support page breaks"}
<foo>
    <bar>
</foo>
```

**Code block with multiple linebreaks should not have the empty lines collapsed**

```

Four empty lines below, one above




Four empty lines above, one below

```

**Code block without line numbers and multiple linebreaks should not have the empty lines collapsed**

```{.no-line-numbers}

Four empty lines below, one above




Four empty lines above, one below

```

**Code block with syntax highlighting and multiple linebreaks should not have the empty lines collapsed**

```js

function fourEmptyLinesBelowOneAbove() {




} // four empty lines above, one below

```

**span with `hljs` class should span multiple lines [(Link for context)](https://github.com/MarkBind/markbind/pull/991#issuecomment-586547275)**

```markdown
*****
-----
```
