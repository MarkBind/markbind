
    var pageVueRenderFn = function anonymous(
) {
with(this){return _c('div',{attrs:{"id":"app"}},[_c('p'),_m(0),_v(" "),_m(1),_v(" "),_m(2),_v(" "),_m(3),_v(" "),_c('testtag',[_c('these',[_v("\nsome text\n")]),_v(" "),_c('p',[_v("//")]),_v(" "),_c('p',[_v("/*\n...\n*/")])],1),_v(" "),_m(4),_v(" "),_c('testselfclosingtag'),_v(" "),_c('testselfclosingtag'),_v(" "),_c('testselfclosingtag',[_c('p',[_v("Lorem ipsum lorem ipsum")])]),_v(" "),_c('i',{staticClass:"fa fa-arrow-circle-up fa-lg d-print-none",attrs:{"id":"scroll-top-button","onclick":"handleScrollTop()","aria-hidden":"true"}}),_c('p')],1)}
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
with(this){return _c('p',[_v("There should be text between this and the next "),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("<hr>")]),_v(" tag, since it is a special tag.\nAll text should appear in the browser window as a single line,\nsave for the comment which the browser still interprets. (but will be in the expected output)")])}
},function anonymous(
) {
with(this){return _c('p',[_v("There are two self closing special tags below, which should display nothing, but are present in the output.\nThere is then one special tag with both and opening and closing tag with some text in it ("),_c('code',{pre:true,attrs:{"class":"hljs inline no-lang"}},[_v("lorem ipsum...")]),_v(").\nNote that script and style tags are still not allowed to be self-closing, as per the html5 spec.")])}
}];
  