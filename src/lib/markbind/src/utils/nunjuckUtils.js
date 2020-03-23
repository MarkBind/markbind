const START_ESCAPE_STR = '{% raw %}';
const END_ESCAPE_STR = '{% endraw %}';
const REGEX = new RegExp('{% *raw *%}(.*?){% *endraw *%}', 'gs');

function preEscapeRawTags(pageData) {
  return pageData.replace(REGEX, `${START_ESCAPE_STR}$&${END_ESCAPE_STR}`);
}

module.exports = {
  renderEscaped(nunjucks, pageData, variableMap = {}, options = {}) {
    const escapedPage = preEscapeRawTags(pageData);
    return nunjucks.renderString(escapedPage, variableMap, options);
  },
};
