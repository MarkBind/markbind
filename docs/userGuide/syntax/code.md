## Code

#### Themes

MarkBind can present formatted code blocks, be it fenced or inline, with either **light** or **dark** themes. The default is dark <trigger for="modal:code-dark-example" trigger="click">_(click for an example)_</trigger>.

<modal header="Dark Code Theme" id="modal:code-dark-example">

<pic src="/images/codeDarkTheme.png" alt="Theme example"></pic>
</modal>

Refer [here](../siteJsonFile.html#style) for configuring MarkBind to use a specific theme for the code blocks.

#### Fenced Code

MarkBind provides several features, some of which are added on top of the existing functionality of Markdown's _fenced code blocks_.

<small>More info: <https://www.markdownguide.org/extended-syntax#fenced-code-blocks></small>

Features:

* Syntax coloring
* Line numbering
* Line highlighting
* Code block headers

##### Syntax coloring

To enable syntax coloring, specify a language next to the backticks before the fenced code block.
<div id="main-example">
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```xml
<foo>
  <bar type="name">goo</bar>
</foo>
```
</variable>
</include>
</div>

##### Line numbering

Line numbers are <tooltip content="Line numbers were provided by default in version v3.1.1 and below. To preserve the exact line numbers behavior of sites generated in previous versions, simply set the codeLineNumbers option in site.json to true">hidden by default</tooltip>. To enable line numbers for the entire site by default,
add `"codeLineNumbers": true` to the [`site.json`]({{baseUrl}}/userGuide/siteJsonFile.html#style) file:

```json {highlight-lines="8[:]"}
{
  // ...
  "style": {
    "bootstrapTheme": "bootswatch-cerulean",
    "codeTheme": "light",
    "codeLineNumbers": true // optional, false if omitted
  }
  // code below omitted for brevity
}
```

For each code block, you may also use the `line-numbers` or `no-line-numbers` classes to override the site-wide setting as such:

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```xml {.line-numbers}
<foo>
  <bar type="name">goo</bar>
</foo>
```
</variable>
</include>

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```xml {.no-line-numbers}
<foo>
  <bar type="name">goo</bar>
</foo>
```
</variable>
</include>

You can have your line numbers start with a value other than `1` with the `start-from` attribute.

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {start-from=6}
function add(a, b) {
    return a + b;
}
```
</variable>
</include>

##### Line highlighting

You can add the `highlight-lines` attribute to add highlighting to your code block. Refer to the examples
below for a visual demonstration of all the possible ways of highlighting a code block.

**Full text highlight**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {start-from=6 .line-numbers highlight-lines="7, 9"}
function add(a, b) {
    const sum = a + b;
    console.log(`${a} + ${b} = ${sum}`);
    return sum;
}
```
</variable>
</include>

**Substring highlight**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {.line-numbers highlight-lines="1['function'], 2['a'], 2['b'], 4['diff']"}
function subtract(a, b) {
    const diff = a - b;
    console.log(`${a} + ${b} = ${diff}`);
    return diff;
}
```
</variable>
</include>

**Character-bounded highlight**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {.line-numbers highlight-lines="1[0:3], 1[6:10], 2[5:], 3[:6]"}
function multiply(a, b) {
    const product = a * b;
    console.log('Product = ${product}');
    return product;
}
```
</variable>
</include>

**Word-bounded highlight**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {.line-numbers highlight-lines="1[1::3], 1[5::7], 2[2::], 3[::3]"}
// Function returns the distance travelled assuming constant speed
function calculateDistance(speed, time) {
    const distance = speed * time;
    console.log(`Distance travelled = ${distance}`);
    return distance;
}
```
</variable>
</include>

**Full-line highlight**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```js {start-from=10 .line-numbers highlight-lines="11[:]"}
function add(a, b) {
    return a + b;
}
```
</variable>
</include>

**Sample Combined Usage**
<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```java {.line-numbers highlight-lines="1[:],3['Inventory'],3[4::6],4['It\'s designed'],5,6[8:15],6[18:],8[0::2],12[:]-14,16-18,20[12:]-22,24[1::]-26"}
import java.util.List;

// Inventory is a class that stores inventory items in a list.
// It's designed as a thin wrapper on the List interface.
public class Inventory {
    private List<Item> items;

    public int getItemCount(){
        return items.size();
    }

    public bool isEmpty() {
        return items.isEmpty();
    }

    public Item getItem(idx: int) {
        return items.get(idx);
    }

    public void addItem(item: Item) {
        return items.add(item);
    }

    public void removeItem(item: Item) {
        return items.remove(item);
    }
}
```
</variable>
</include>

The value of `highlight-lines` is composed of *highlight rules*, separated by commas.
These rules dictate where and how MarkBind should highlight your code block.

You can specify the highlight rules in many different ways, each is detailed as follows:

Type | Format | Example
-----|--------|--------
**Full text highlight**<br>Highlights the entirety of the text portion of the line | The line numbers as-is (subject to the starting line number set in `start-from`). | `3`, `5`
**Substring highlight**<br>Highlights _all_ occurrences of a substring in the line | `lineNumber[part]`<br><br>_Limitations_: `part` must be wrapped in quotes. If `part` contains a quote, escape it with a backslash (`\`). | `3['Inventory']`,`4['It\'s designed']`
**Character-bounded highlight**<br>Highlights a specific range of characters in the line | `lineNumber[start:end]`, highlights from character position `start` up to (but not including) `end`.<br><br>Character positions start from `0` as the first non-whitespace character, upwards.<br><br>Omit either `start`/`end` to highlight from the start / up to the end, respectively. | `19[1:5]`,`30[10:]`,`35[:20]`
**Word-bounded highlight**<br>Highlights a specific range of words in the line | `lineNumber[start::end]`, highlights from word position `start` up to (but not including) `end`.<br><br>Word positions start from `0` as the first word (sequence of non-whitespace characters), upwards.<br><br>Omit either `start`/`end` to highlight from the start / up to the end, respectively. | `5[2::4]`,`9[1::]`,`11[::5]`
**Full line highlight**<br>Highlights the entirety of the line | `lineNumber[:]` | `7[:]`

Not only a single line, MarkBind is also capable of highlighting ranges of lines in various ways. In general, the syntax
for range highlighting consists of two single line highlight rules as listed above joined by a dash (`-`).

Type | Format | Example
-----|--------|--------
**Ranged full text highlight**<br>Highlights from the first non-whitespace character to the last non-whitespace character | `lineStart-lineEnd` | `2-4`
**Ranged full line highlight**<br>Like ranged full text highlight, but highlights the entirety of the lines | `lineStart[:]-lineEnd` or `lineStart-lineEnd[:]` | `1[:]-5`,`10-12[:]`
**Ranged character-bounded highlight**<br>Highlights the text portion of the lines within the range, but starts/ends at an arbitrary character | `lineStart[start:]-lineEnd` or `lineStart-lineEnd[:end]` | `3[2:]-7`, `4-9[:17]`
**Ranged word-bounded highlight**<br>Like ranged character-bounded highlight, but starts/ends at an arbitrary word | `lineStart[start::]-lineEnd` or `lineStart-lineEnd[::end]` | `16[1::]-20`,`22-24[::3]`

##### Heading
To add a heading, add the attribute `heading` with the heading text as the value, as shown below.

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```xml {heading="Heading title"}
<foo>
  <bar type="name">goo</bar>
</foo>
```

</variable>
</include>

Headings support inline Markdown, except for `Inline Code` and %%Dim%% text styles.

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```{heading="**Bold**, _Italic_, ___Bold and Italic___, ~~Strike through~~, ****Super Bold****, !!Underline!!, ==Highlight==, :+1: :exclamation: :x: :construction:<br>We support page breaks"}
<foo></foo>
```
</variable>
</include>

##### Using multiple features

You can also use multiple features together, as shown below.

<include src="codeAndOutputCode.md" boilerplate >
<variable name="code">
```xml {highlight-lines="2" heading="Heading title"}
<foo>
  <bar type="name">goo</bar>
</foo>
```
</variable>
</span>
</include>

##### Copy button

A _copy_ button can be added to code blocks using the `codeBlockCopyButtons` plugin:

<panel type="seamless" header="**User Guide: Using Plugins → Plugin: `codeBlockCopyButtons`**" popup-url="usingPlugins.html#plugin-codeblockcopybuttons">

  <include src="../plugins/codeBlockCopyButtons.md" />

</panel>
<br>

##### Wrap text button

A _wrap text_ button can be added to code blocks using the `codeBlockWrapButtons` plugin:

<panel type="seamless" header="**User Guide: Using Plugins → Plugin: `codeBlockWrapButtons`**" popup-url="usingPlugins.html#plugin-codeblockwrapbuttons">

  <include src="../plugins/codeBlockWrapButtons.md" />

</panel>
<br>

##### Printing optimization

<div id="code-print-optimization">
Markbind enhances the readability of your code blocks for printing by applying soft wrapping, ensuring code doesn't get cut off. Additionally, line numbers are added to maintain context when wrapping occurs.
</div>
<br>

#### Inline Code

##### Syntax coloring

MarkBind can apply syntax-coloring on inline code too.

<include src="codeAndOutput.md" boilerplate >
<variable name="code">
Consider the XML code `<bar type="name">goo</bar>`{.xml},<br>
or the java code `public static void main(String[] args)`{.java}.
</variable>
</include>

{% raw %}

##### Displaying content within curly braces: `{{ content }}`

If your code contains special Nunjucks tags like `{{` or `}}`, use a [raw-endraw block](../tipsAndTricks.html#using-raw-endraw-to-display-content):

```markdown
{% raw %} {{ content }} {% endraw %}
```
{% endraw %}

<div id="short" class="d-none">

````
```xml
<foo>
  <bar type="name">goo</bar>
</foo>
```
````

```
`<bar type="name">goo</bar>`{.xml}
```

</div>

<div id="examples" class="d-none">

```xml
<foo>
  <bar type="name">goo</bar>
</foo>
```

Syntax coloring for inline code: `<bar type="name">goo</bar>`{.xml} too!

</div>
