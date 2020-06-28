const nunjucks = require('nunjucks');
const dateFilter = require('../lib/nunjucks-extensions/nunjucks-date').filter;

const unescapedEnv = nunjucks.configure({ autoescape: false }).addFilter('date', dateFilter);

module.exports = {
  renderRaw(pageData, variableMap = {}) {
    return unescapedEnv.renderString(pageData, variableMap);
  },

  compile(src, ...args) {
    return nunjucks.compile(src, unescapedEnv, ...args);
  },
};
