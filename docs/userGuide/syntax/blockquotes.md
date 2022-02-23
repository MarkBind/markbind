## Blockquotes

<include src="codeAndOutput.md" boilerplate >
<variable name="code">
Normal text
> Blockquote, first paragraph
>
> Second paragraph
>> Nested quoteblock
</variable>
</include>

Alternatively, you can use `<blockquote>` tags:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
Normal text
<blockquote>
Blockquote, first paragraph

Second paragraph
<blockquote>
Nested blockquote
</blockquote>
</blockquote>
</variable>
</include>

<small>More info: https://www.markdownguide.org/basic-syntax#blockquotes-1</small>

<span id="short" class="d-none">

```
> Blockquote, first paragraph
>
> Second paragraph
>> Nested blockquote
```
</span>
<span id="examples" class="d-none">

> Blockquote, first paragraph
>
> Second paragraph
>> Nested blockquote
</span>
