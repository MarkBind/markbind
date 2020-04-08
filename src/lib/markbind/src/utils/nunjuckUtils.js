const nunjucks = require('nunjucks');
const dateFilter = require('../lib/nunjucks-extensions/nunjucks-date');

const commonEnv = nunjucks.configure().addFilter('date', dateFilter);
const unescapedEnv = nunjucks.configure({ autoescape: false }).addFilter('date', dateFilter);

const START_ESCAPE_STR = '{% raw %}';
const END_ESCAPE_STR = '{% endraw %}';
const REGEX = new RegExp('{% *raw *%}(.*?){% *endraw *%}', 'gs');

function preEscapeRawTags(pageData) {
  return pageData.replace(REGEX, `${START_ESCAPE_STR}$&${END_ESCAPE_STR}`);
}

module.exports = {
  renderRaw(pageData, variableMap = {}, options = {}, autoescape = true) {
    const escapedPage = preEscapeRawTags(pageData);
    if (autoescape) return commonEnv.renderString(escapedPage, variableMap, options);
    return unescapedEnv.renderString(escapedPage, variableMap, options);
  },
  renderString(pageData, variableMap = {}, options = {}, env = commonEnv) {
    return env.renderString(pageData, variableMap, options);
  },
  compile(src, ...args) {
    return nunjucks.compile(src, unescapedEnv, ...args);
  },
};
