const fs = require('fs-extra');
const path = require('path');

const { Parser } = require('nunjucks/src/parser');
const { lex } = require('nunjucks/src/lexer');

const _ = {};
_.isArray = require('lodash/isArray');
_.isObject = require('lodash/isObject');
_.isString = require('lodash/isString');

const logger = require('../../utils/logger');

/**
 * Nunjucks extension for sourcing in variables from external sources.
 * Supports only .json sources for now.
 */
class SetExternalExtension {
  constructor(rootPath, env) {
    this.tags = ['ext'];
    this.rootPath = rootPath;
    this.env = env;
  }

  emitLoad(fullPath) {
    // Emit the nunjucks load event for the listener in {@link VariableRenderer}
    this.env.emit('load', '', { path: fullPath });
  }

  parse(parser, nodes, lexer) {
    // get the tag token
    const setExtTagToken = parser.nextToken();

    // parse the args and move after the block end. passing true
    // as the second arg is required if there are no parentheses
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(setExtTagToken.value);
    const firstChild = args.children[0];

    const buffer = [];
    if (firstChild instanceof nodes.KeywordArgs) {
      firstChild.children.forEach((pair) => {
        const variableName = pair.key.value;
        const resourcePath = pair.value.value;

        if (resourcePath.endsWith('.json')) {
          const fullResourcePath = path.resolve(this.rootPath, resourcePath);
          const resourceRaw = fs.readFileSync(fullResourcePath);
          buffer.push(`{% set ${variableName} = ${resourceRaw} %}`);
          this.emitLoad(fullResourcePath);
        }
      });
    } else {
      logger.error(`Invalid {% ext %} tag at line ${setExtTagToken.lineno}.`);
      return new nodes.NodeList(setExtTagToken.lineno, setExtTagToken.colno, []);
    }

    const newParser = new Parser(lex(buffer.join('\n'), lexer.opts));
    if (parser.extensions !== undefined) {
      newParser.extensions = parser.extensions;
    }

    return newParser.parse();
  }
}

module.exports = {
  SetExternalExtension,
};
