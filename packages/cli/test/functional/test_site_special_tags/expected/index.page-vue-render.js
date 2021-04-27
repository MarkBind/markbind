
    var pageVueRenderFn = function anonymous(
) {
with(this){return _c('div',{attrs:{"id":"app"}},[_c('p'),_m(0),_v(" "),_m(1),_v(" "),_m(2),_v(" "),_c('script',{attrs:{"type":"application/javascript"}},[_v("\nlet x = 1;\n\nx += 1;\nalert(x);\n")]),_v(" "),_c('hr'),_v(" "),_m(3),_v(" "),_c('script',{attrs:{"src":"","defer":"","type":"application/javascript","style-bypass-vue-compilation":""}},[_v("\n\n.bigger-text {\n  font-size: 10em;\n}\n\n")]),_v(" "),_c('hr'),_v(" "),_m(4),_v(" "),_c('testtag',[_c('these',[_v("\nsome text\n")]),_v(" "),_c('p',[_v("//")]),_v(" "),_c('p',[_v("/*\n...\n*/")])],1),_v(" "),_c('hr'),_v(" "),_m(5),_v(" "),_c('abc',[_c('these',[_v("\nsome text\n")]),_v(" "),_c('p',[_v("//")]),_v(" "),_c('p',[_v("/*\n...\n*/")])],1),_v(" "),_c('hr'),_v(" "),_m(6),_v(" "),_c('testselfclosingtag'),_v(" "),_c('testselfclosingtag'),_v(" "),_c('testselfclosingtag',[_c('p',[_v("Lorem ipsum lorem ipsum")])]),_v(" "),_c('hr'),_v(" "),_m(7),_v(" "),_c('div',[_c('testtag',[_v("\nlet x = 2;\n"),_c('p',[_v("if (x <= 5) {\nalert(x);\n}")])])],1),_v(" "),_c('hr'),_v(" "),_c('i',{staticClass:"fa fa-arrow-circle-up fa-lg d-print-none",attrs:{"id":"scroll-top-button","onclick":"handleScrollTop()","aria-hidden":"true"}}),_c('p')],1)}
};
    var pageVueStaticRenderFns = [function anonymous(
) {
with(this){return _c('h1',{attrs:{"id":"functional-test-for-htmlparser2-and-markdown-it-patches-for-special-tags"}},[_c('span',{staticClass:"anchor",attrs:{"id":"functional-test-for-htmlparser2-and-markdown-it-patches-for-special-tags"}}),_v("Functional test for htmlparser2 and markdown-it patches for special tags"),_c('a',{staticClass:"fa fa-anchor",attrs:{"href":"#functional-test-for-htmlparser2-and-markdown-it-patches-for-special-tags","onclick":"event.stopPropagation()"}})])}
},function anonymous(
) {
with(this){return _c('h2',{attrs:{"id":"so-far-as-to-comply-with-the-commonmark-spec"}},[_c('span',{staticClass:"anchor",attrs:{"id":"so-far-as-to-comply-with-the-commonmark-spec"}}),_v("So far as to comply with the commonmark spec"),_c('a',{staticClass:"fa fa-anchor",attrs:{"href":"#so-far-as-to-comply-with-the-commonmark-spec","onclick":"event.stopPropagation()"}})])}
},function anonymous(
) {
with(this){return _c('p',[_v("There should be no text between this and the next "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<hr>")]),_v(" tag in the browser, since it is a "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<script>")]),_v(" tag."),_c('br'),_v("\nThere should be an alert with the value of 2 as well.")])}
},function anonymous(
) {
with(this){return _c('p',[_v("There should be no text between this and the next "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<hr>")]),_v(" tag in the browser, since it is a "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<style>")]),_v(" tag.")])}
},function anonymous(
) {
with(this){return _c('p',[_v("There should be text between this and the next "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<hr>")]),_v(" tag, since it is a special tag.\nAll text should appear in the browser window as a single line,\nsave for the comment which the browser still interprets. (but will be in the expected output)")])}
},function anonymous(
) {
with(this){return _c('p',[_v("This has the same content has the previous test, but it is "),_c('strong',[_v("not")]),_v(" a special tag.\nThe html comment "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<!-- -->")]),_v(" should disappear in the expected output.\nThe line "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("some text")]),_v(" should appear as per normal, and not wrapped by a paragraph since\na html tag precedes it without a blank line.\nThe other lines should be parsed as markdown paragraphs, as per commonmark spec.")])}
},function anonymous(
) {
with(this){return _c('p',[_v("There are two self closing special tags below, which should display nothing, but are present in the output.\nThere is then one special tag with both and opening and closing tag with some text in it ("),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("lorem ipsum...")]),_v(").\nNote that script and style tags are still not allowed to be self-closing, as per the html5 spec.")])}
},function anonymous(
) {
with(this){return _c('p',[_v("This should pass the htmlparser2 patch but not the markdown-it patch as it violates commonmark."),_c('br'),_v("\nAll lines after the first "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("!success")]),_v(" wrapping text will be wrapped in a "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<p>...</p>")]),_v(" tag as it is\nparsed as a markdown paragraph.")])}
}];
  