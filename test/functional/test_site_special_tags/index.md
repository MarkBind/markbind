# Functional test for htmlparser2 and markdown-it patches for special tags
## So far as to comply with the commonmark spec

There should be no text between this and the next `<hr>` tag in the browser, since it is a `<script>` tag.<br>
There should be an alert with the value of 2 as well.

<script>
let x = 1;

x += 1;
alert(x);
</script>

---

There should be no text between this and the next `<hr>` tag in the browser, since it is a `<style>` tag.

<style>

.bigger-text {
  font-size: 10em;
}

</style>

---

There should be text between this and the next `<hr>` tag, since it is a special tag.
All text should appear in the browser window as a single line,
save for the comment which the browser still interprets. (but will be in the expected output)

<testtag>
<these>
some text
</these>

<!-- -->

//

/*
...
*/
</testtag>

---

This has the same content has the previous test, but it is **not** a special tag.
The html comment `<!-- -->` should disappear in the expected output.
The line `some text` should appear as per normal, and not wrapped by a paragraph since
a html tag precedes it without a blank line.
The other lines should be parsed as markdown paragraphs, as per commonmark spec.

<abc>
<these>
some text
</these>

<!-- -->

//

/*
...
*/
</abc>

---

This should pass the htmlparser2 patch but not the markdown-it patch as it violates commonmark.<br>
All lines after the first `!success` wrapping text will be wrapped in a `<p>...</p>` tag as it is
parsed as a markdown paragraph.

<div>
<testtag>
let x = 2;

if (x <= 5) {
  alert(x);
}
</testtag>
</div>

---
