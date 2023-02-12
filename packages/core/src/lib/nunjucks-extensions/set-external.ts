import fs from 'fs-extra';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';
import { Environment, Extension } from 'nunjucks';
// Type definitions are undefined / documented and in flux for these. See the source.
// @ts-ignore
import { Parser } from 'nunjucks/src/parser';
// @ts-ignore
import { lex } from 'nunjucks/src/lexer';

import * as logger from '../../utils/logger';

const acceptedFileTypes = ['json', 'csv'];

/**
 * Nunjucks extension for sourcing in variables from external sources.
 * Supports only .json and .csv sources for now.
 */
export class SetExternalExtension implements Extension {
  tags = ['ext'];

  constructor(private rootPath: string, private env: Environment) {}

  emitLoad(fullPath: string) {
    // Emit the nunjucks load event for the listener in {@link VariableRenderer}. No type defs.
    // @ts-ignore
    this.env.emit('load', '', { path: fullPath });
  }

  parse(parser: any, nodes: any, lexer: any) {
    // get the tag token
    const setExtTagToken = parser.nextToken();

    // parse the args and move after the block end. passing true
    // as the second arg is required if there are no parentheses
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(setExtTagToken.value);

    const options = args.children
      .filter((child: any) => !(child instanceof nodes.KeywordArgs))
      .map((child: any) => child.value as string);

    // last child contains the kvp containing the path to the external variable source
    const lastChild = args.children[args.children.length - 1];

    const buffer: string[] = [];
    if (lastChild instanceof nodes.KeywordArgs) {
      lastChild.children.forEach((pair: any) => {
        const variableName = pair.key.value;
        const resourcePath = pair.value.value;
        acceptedFileTypes.forEach((fileType) => {
          if (!resourcePath.endsWith(fileType)) {
            return;
          }

          const fullResourcePath = path.resolve(this.rootPath, resourcePath);
          if (fileType === 'json') {
            const resourceRaw = fs.readFileSync(fullResourcePath);
            buffer.push(`{% set ${variableName} = ${resourceRaw} %}`);
          } else if (fileType === 'csv') {
            const hasNoHeader = options.includes('noHeader');

            const csvResourceRaw = csvParse(
              fs.readFileSync(fullResourcePath), {
                bom: true, // strip the byte order mark (BOM) from the input string or buffer.
                columns: (
                  hasNoHeader
                    ? false // if noHeader is present, first row is not header row
                    : header => header.map((col: string) => col)
                ),
              });
            const resourceRaw = JSON.stringify(csvResourceRaw);
            buffer.push(`{% set ${variableName} = ${resourceRaw} %}`);
          }
          this.emitLoad(fullResourcePath);
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
