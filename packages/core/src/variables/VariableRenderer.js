const nunjucks = require('nunjucks');
const { filter: dateFilter } = require('../lib/nunjucks-extensions/nunjucks-date');

const unescapedEnv = nunjucks.configure({ autoescape: false }).addFilter('date', dateFilter);

const START_ESCAPE_STR = '{% raw %}';
const END_ESCAPE_STR = '{% endraw %}';
const RAW_TAG_REGEX = new RegExp('{% *(end)?raw *%}', 'g');

/**
 * Pads the outermost {% raw %} {% endraw %} pairs with {% raw %} {% endraw %} again.
 * This is used during {@link generateExpressiveLayout}, where we do two nunjucks calls,
 * one to render the layout file and another to insert the page's content.
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

/**
 * Wrapper class over a nunjucks environment configured for the respective (sub)site.
 */
class VariableRenderer {
  constructor(siteRootPath) {
    this.nj = nunjucks.configure(siteRootPath, { autoescape: false }).addFilter('date', dateFilter);
  }

  /**
   * Processes content with the instance's nunjucks environment.
   * @param content to process
   * @param variables to render the content with
   * @param keepPercentRaw whether to keep the {% raw/endraw %} nunjucks tags
   * @return {String} nunjucks processed content
   */
  render(content, variables = {}, keepPercentRaw = false) {
    return keepPercentRaw
      ? this.nj.renderString(preEscapeRawTags(content), variables)
      : this.nj.renderString(content, variables);
  }

  /**
   * Compiles a template specified at src independent of the template directory.
   * This is used for the page template file (page.njk), where none of nunjucks' features
   * involving path resolving are used.
   * @param templatePath of the template to compile
   */
  static compile(templatePath) {
    return nunjucks.compile(templatePath, unescapedEnv);
  }
}

module.exports = VariableRenderer;
