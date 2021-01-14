const fs = require('fs-extra');
const path = require('path');

const { Parser } = require('nunjucks/src/parser');
const { lex } = require('nunjucks/src/lexer');

const csvParse = require('csv-parse/lib/sync');

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
    this.acceptedFileTypes = ['json', 'csv'];
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

    // process optional props first
    const props = [];
    args.children
      .filter(child => !(child instanceof nodes.KeywordArgs))
      .forEach(child => props.push(child.value));

    // last child contains the kvp containing the path to the external variable source
    const lastChild = args.children[args.children.length - 1];

    const buffer = [];
    if (lastChild instanceof nodes.KeywordArgs) {
      lastChild.children.forEach((pair) => {
        const variableName = pair.key.value;
        const resourcePath = pair.value.value;

        this.acceptedFileTypes.forEach((fileType) => {
          if (resourcePath.endsWith(fileType)) {
            const fullResourcePath = path.resolve(this.rootPath, resourcePath);
            if (fileType === 'json') {
              const resourceRaw = fs.readFileSync(fullResourcePath);
              buffer.push(`{% set ${variableName} = ${resourceRaw} %}`);
            } else if (fileType === 'csv') {
              const hasNoHeader = props.includes('noHeader');

              const csvResourceRaw = csvParse(
                fs.readFileSync(fullResourcePath), {
                  bom: true, // strip the byte order mark (BOM) from the input string or buffer.
                  columns: (
                    hasNoHeader
                      ? false // if noHeader is present, first row is not header row
                      : header => header.map(col => col)
                  ),
                });
              const resourceRaw = JSON.stringify(csvResourceRaw);
              buffer.push(`{% set ${variableName} = ${resourceRaw} %}`);
            }
            this.emitLoad(fullResourcePath);
          }
        });
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
