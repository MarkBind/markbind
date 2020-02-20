const START_ESCAPE_STR = '{% raw %}';
const END_ESCAPE_STR = '{% endraw %}';
const REGEX = new RegExp('{% *raw *%}(.*?){% *endraw *%}', 'gs'); // eslint-disable-line no-useless-escape

function addEscapeTags(match) {
  return `${START_ESCAPE_STR}${match}${END_ESCAPE_STR}`;
}

function removeEscapeTags(_, p1) {
  return p1;
}

function preEscapeRawTags(pageData) {
  return pageData.replace(REGEX, addEscapeTags);
}

module.exports = {
  renderEscaped(nunjucks, pageData, variableMap = {}, options = {}) {
    const escapedPage = preEscapeRawTags(pageData);
    return nunjucks.renderString(escapedPage, variableMap, options);
  },

  /**
   * RemoveNunjucksEscapes removes raw tags from page data when processing
   * Downstream calls to nunjuckUtils.renderEscaped will be essentially the same as nunjucks.renderString
   * This ensures that we remove {{ and }} from the final output which prevents problem with Vue
   */
  removeNunjucksEscapes(pageData) {
    return pageData.replace(REGEX, removeEscapeTags);
  },
};
