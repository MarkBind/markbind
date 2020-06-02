const nunjucks = require('nunjucks');
const dateFilter = require('../lib/nunjucks-extensions/nunjucks-date');

const commonEnv = nunjucks.configure().addFilter('date', dateFilter);
const unescapedEnv = nunjucks.configure({ autoescape: false }).addFilter('date', dateFilter);

const START_ESCAPE_STR = '{% raw %}';
const END_ESCAPE_STR = '{% endraw %}';
const RAW_TAG_REGEX = new RegExp('{% *(end)?raw *%}', 'g');

/**
 * Pads the outermost {% raw %} {% endraw %} pairs with {% raw %} {% endraw %} again.
 * This allows variables and other nunjuck syntax inside {% raw %} {% endraw %} tags
 * to be ignored by nunjucks until the final renderString call.
 */
function preEscapeRawTags(pageData) {
  // TODO simplify using re.matchAll once node v10 reaches 'eol'
  // https://github.com/nodejs/Release#nodejs-release-working-group
  const tagMatches = [];
  let tagMatch = RAW_TAG_REGEX.exec(pageData);
  while (tagMatch !== null) {
    tagMatches.push(tagMatch);
    tagMatch = RAW_TAG_REGEX.exec(pageData);
  }

  const tagInfos = Array.from(tagMatches, match => ({
    isStartTag: !match[0].includes('endraw'),
    index: match.index,
    content: match[0],
  }));

  let numStartRawTags = 0; // nesting level of {% raw %}
  let lastTokenEnd = 0;
  const tokens = [];

  for (let i = 0; i < tagInfos.length; i += 1) {
    const { index, isStartTag, content } = tagInfos[i];
    const currentTokenEnd = index + content.length;
    tokens.push(pageData.slice(lastTokenEnd, currentTokenEnd));
    lastTokenEnd = currentTokenEnd;

    if (isStartTag) {
      if (numStartRawTags === 0) {
        // only pad outermost {% raw %} with an extra {% raw %}
        tokens.push(START_ESCAPE_STR);
      }
      numStartRawTags += 1;
    } else {
      if (numStartRawTags === 1) {
        // only pad outermost {% endraw %} with an extra {% endraw %}
        tokens.push(END_ESCAPE_STR);
      }
      numStartRawTags -= 1;
    }
  }
  // add the last token
  tokens.push(pageData.slice(lastTokenEnd));

  return tokens.join('');
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
