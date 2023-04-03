import MarkdownIt, { Options } from 'markdown-it';
import StateBlock from 'markdown-it/lib/rules_block/state_block';
import Token from 'markdown-it/lib/token';
import Renderer from 'markdown-it/lib/renderer';

/*
 * This file exports a MarkdownIt plugin that converts YAML-style frontmatter syntax (---)
 * into HTML-style `<frontmatter>` tags.
 * Only if there are two sets of `---` and the content inside contains key-value pairs or blank space.
 */
export = function alt_frontmatter_plugin(md: MarkdownIt): void {
  function alt_frontmatter(state: StateBlock, startLine: number, endLine: number): boolean {
    const fmSymbol = '---';
    const keyValueRegex = /^\w+:\s+.*/;

    let lineStart = state.bMarks[startLine] + state.tShift[startLine];
    let lineEnd = state.eMarks[startLine];
    const marker = state.src.slice(lineStart, lineEnd);
    if (marker !== fmSymbol) {
      return false;
    }

    let haveEndMarker = false;
    let nextLine = startLine + 1;
    for (; nextLine < endLine; nextLine += 1) {
      lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      lineEnd = state.eMarks[nextLine];

      const currLine = state.src.slice(lineStart, lineEnd).trim();
      if (currLine === fmSymbol) {
        haveEndMarker = true;
        break;
      }
      if (!(keyValueRegex.test(currLine) || currLine.length === 0)) {
        // terminates if not key value or blank line.
        return false;
      }
    }

    if (!haveEndMarker) {
      return false;
    }
    // If a fence has heading spaces, they should be removed from its inner block
    const len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);

    const token: Token = state.push('alt_frontmatter', '', 0);
    token.info = fmSymbol;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = marker;
    token.map = [startLine, state.line];
    return true;
  }

  md.block.ruler.before('fence', 'alt_frontmatter', alt_frontmatter);
  md.renderer.rules.alt_frontmatter = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: any,
    slf: Renderer,
  ) => {
    const token = tokens[idx];
    if (token.type === 'alt_frontmatter' && token.info === '---') {
      return `<frontmatter>\n${token.content}</frontmatter>\n`;
    }
    return slf.renderToken(tokens, idx, options);
  };
};
