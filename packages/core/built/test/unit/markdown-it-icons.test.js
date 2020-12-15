var expectedOcticon = require('@primer/octicons')['git-pull-request'].toSVG();
var markdownIt = require('../../src/lib/markdown-it');
test('markdown-it-icons renders icon syntax correctly', function () {
    var source = ':fab-font-awesome: :glyphicon-home: :octicon-git-pull-request:';
    var result = markdownIt.renderInline(source);
    var expected = [
        '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
        '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
        expectedOcticon,
    ].join(' ');
    expect(result).toEqual(expected);
});
test('markdown-it-icons renders icon syntax in multi-line source correctly', function () {
    var source = [
        'text with special characters: before icons',
        ':fab-font-awesome:',
        'text with special characters: between icons',
        ':glyphicon-home:',
        'more text with special characters: between icons',
        ':octicon-git-pull-request:',
        'text with special characters: after icons',
    ].join('\n');
    var result = markdownIt.renderInline(source);
    var expected = [
        'text with special characters: before icons',
        '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
        'text with special characters: between icons',
        '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
        'more text with special characters: between icons',
        expectedOcticon,
        'text with special characters: after icons',
    ].join('\n');
    expect(result).toEqual(expected);
});
