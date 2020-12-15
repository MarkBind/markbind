var cheerio = module.parent.require('cheerio');
var escapeRegExp = module.parent.require('lodash/escapeRegExp');
/**
 * Filters out elements on the page based on config tags
 * @param tags to filter
 * @param content of the page
 */
function filterTags(tags, content) {
    if (!tags) {
        return content;
    }
    var $ = cheerio.load(content);
    var tagOperations = tags.map(function (tag) { return ({
        // Trim leading + or -, replace * with .*, add ^ and $
        tagExp: "^" + escapeRegExp(tag.replace(/^(\+|-)/g, '')).replace(/\\\*/, '.*') + "$",
        // Whether it is makes tags visible or hides them
        isHidden: tag.startsWith('-'),
    }); });
    $('[tags]').each(function (i, element) {
        $(element).attr('hidden', true);
        $(element).attr('tags').split(' ').forEach(function (tag) {
            tagOperations.forEach(function (tagOperation) {
                if (!tag.match(tagOperation.tagExp)) {
                    return;
                }
                if (tagOperation.isHidden) {
                    $(element).attr('hidden', true);
                }
                else {
                    $(element).removeAttr('hidden');
                }
            });
        });
    });
    $('[hidden]').remove();
    return $.html();
}
module.exports = {
    postRender: function (pluginContext, frontMatter, content) {
        // Tags specified in site.json will be merged with tags specified in front matter
        var mergedTags = (frontMatter.tags || []).concat(pluginContext.tags || []);
        return filterTags(mergedTags, content);
    },
};
