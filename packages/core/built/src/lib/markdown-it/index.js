var hljs = require('highlight.js');
var markdownIt = require('markdown-it')({
    html: true,
    linkify: true
});
var slugify = require('@sindresorhus/slugify');
var HighlightRule = require('./highlight/HighlightRule.js').HighlightRule;
// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
    .use(require('markdown-it-ins'))
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'))
    .use(require('markdown-it-imsize'), { autofill: false })
    .use(require('markdown-it-table-of-contents'))
    .use(require('markdown-it-task-lists'), { enabled: true })
    .use(require('markdown-it-linkify-images'), { imgClass: 'img-fluid' })
    .use(require('markdown-it-texmath'), { engine: require('katex'), delimiters: 'brackets' })
    .use(require('./patches/markdown-it-attrs-nunjucks'))
    .use(require('./markdown-it-dimmed'))
    .use(require('./markdown-it-radio-button'))
    .use(require('./markdown-it-block-embed'))
    .use(require('./markdown-it-icons'))
    .use(require('./markdown-it-footnotes'));
// fix link
markdownIt.normalizeLink = require('./normalizeLink');
// fix table style
markdownIt.renderer.rules.table_open = function (tokens, idx) {
    return '<div class="table-responsive"><table class="markbind-table table table-bordered table-striped">';
};
markdownIt.renderer.rules.table_close = function (tokens, idx) {
    return '</table></div>';
};
function getAttributeAndDelete(token, attr) {
    var index = token.attrIndex(attr);
    if (index === -1) {
        return undefined;
    }
    // tokens are stored as an array of two-element-arrays:
    // e.g. [ ['highlight-lines', '1,2,3'], ['start-from', '1'] ]
    var value = token.attrs[index][1];
    token.attrs.splice(index, 1);
    return value;
}
// syntax highlight code fences and add line numbers
markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    var token = tokens[idx];
    var lang = token.info || '';
    var str = token.content;
    var highlighted = false;
    var lines;
    if (lang && hljs.getLanguage(lang)) {
        try {
            /* We cannot syntax highlight THEN split by lines. For eg:
            ```markdown
            *****
            -----
            ```
      
            becomes
      
            <span class="hljs-section">*****
            -----</span>
            Note the line break contained inside a <span> element.
            So we have to split by lines THEN syntax highlight.
             */
            var state_1 = null; // state stores the current parse state of hljs, so that we can pass it on line by line
            lines = str.split('\n').map(function (line) {
                var highlightedLine = hljs.highlight(lang, line, true, state_1);
                state_1 = highlightedLine.top;
                return highlightedLine.value;
            });
            highlighted = true;
        }
        catch (_) { }
    }
    if (!highlighted) {
        lines = markdownIt.utils.escapeHtml(str).split('\n');
    }
    var startFromOneBased = Math.max(1, parseInt(getAttributeAndDelete(token, 'start-from'), 10) || 1);
    var startFromZeroBased = startFromOneBased - 1;
    if (startFromOneBased > 1) {
        // counter is incremented on each span, so we need to subtract 1
        token.attrJoin('style', "counter-reset: line " + startFromZeroBased + ";");
    }
    var highlightLinesInput = getAttributeAndDelete(token, 'highlight-lines');
    var highlightRules = [];
    if (highlightLinesInput) {
        var highlightLines = highlightLinesInput.split(',');
        highlightRules = highlightLines.map(HighlightRule.parseRule);
        // Note: authors provide line numbers based on the 'start-from' attribute if it exists,
        //       so we need to shift line numbers back down to start at 0
        highlightRules.forEach(function (rule) { return rule.offsetLines(-startFromZeroBased); });
    }
    lines.pop(); // last line is always a single '\n' newline, so we remove it
    // wrap all lines with <span> so we can number them
    str = lines.map(function (line, index) {
        var currentLineNumber = index + 1;
        var rule = highlightRules.find(function (rule) { return rule.shouldApplyHighlight(currentLineNumber); });
        if (rule) {
            return rule.applyHighlight(line);
        }
        // not highlighted
        return "<span>" + line + "\n</span>";
    }).join('');
    token.attrJoin('class', 'hljs');
    if (highlighted) {
        token.attrJoin('class', lang);
    }
    var heading = token.attrGet('heading');
    var codeBlockContent = "<pre><code " + slf.renderAttrs(token) + ">" + str + "</code></pre>";
    if (heading) {
        var renderedHeading = markdownIt.renderInline(heading);
        var headingStyle = (renderedHeading === heading) ? 'code-block-heading' : 'code-block-heading inline-markdown-heading';
        return '<div class="code-block">'
            + ("<div class=\"" + headingStyle + "\"><span>" + renderedHeading + "</span></div>")
            + ("<div class=\"code-block-content\">" + codeBlockContent + "</div>")
            + '</div>';
    }
    return codeBlockContent;
};
// highlight inline code
markdownIt.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
    var token = tokens[idx];
    var lang = token.attrGet('class');
    var inlineClass = "hljs inline";
    if (lang && hljs.getLanguage(lang)) {
        token.attrSet('class', inlineClass + " " + lang);
        return '<code' + slf.renderAttrs(token) + '>'
            + hljs.highlight(lang, token.content, true).value
            + '</code>';
    }
    else {
        token.attrSet('class', inlineClass + " no-lang");
        return '<code' + slf.renderAttrs(token) + '>'
            + markdownIt.utils.escapeHtml(token.content)
            + '</code>';
    }
};
var fixedNumberEmojiDefs = require('./markdown-it-emoji-fixed');
markdownIt.use(require('markdown-it-emoji'), {
    defs: fixedNumberEmojiDefs
});
module.exports = markdownIt;
