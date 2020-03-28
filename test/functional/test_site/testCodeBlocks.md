**Code blocks test**

**Multiple linebreaks, no highlight**

```
Four empty lines below




Four empty lines above
```

**Multiple linebreaks, with highlight**

```js
function fourEmptyLinesBelow() {




} // four empty lines above
```

**hljs span spanning multiple lines**

```markdown
*****
-----
```

**start-from attr causes inline style to be set**
```markdown {start-from=30}
*****
-----
```

**highlight-lines attr causes corresponding lines to have 'highlighted' class**
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

**highlight-lines attr with start-from attr cause corresponding lines to have 'highlighted' class based on 'start-from'**
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

**Code block heading**

```{heading="A heading"}
<foo>
    <bar>
</foo>
```

**Code block heading with inline markdown**

```{heading="**Bold**, _Italic_, ___Bold and Italic___, ~~Strike through~~, ****Super Bold****, ++Underline++, ==Highlight==, :+1: :exclamation: :x: :construction:<br>We support page breaks"}
<foo>
    <bar>
</foo>
```
