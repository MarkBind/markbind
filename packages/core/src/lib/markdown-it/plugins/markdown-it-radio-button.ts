import crypto from 'crypto';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import StateCore from 'markdown-it/lib/rules_core/state_core';

interface RadioOptions {
  enabled?: boolean;
  label?: boolean;
}

/**
 * Modified from https://github.com/revin/markdown-it-task-lists/blob/master/index.js
 */
export function radioButtonPlugin(md: MarkdownIt, options?: RadioOptions): void {
  const disableRadio = options ? !options.enabled : false;
  const useLabelWrapper = options ? !!options.label : true;

  md.core.ruler.after('inline', 'radio-lists', (state: StateCore) => {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      if (isTodoItem(tokens, i)) {
        const parentIdx = parentToken(tokens, i - 2);
        if (parentIdx === -1) continue;

        const parent = tokens[parentIdx];
        let groupAttr = attrGet(parent, 'radio-group'); // try retrieve the group id
        let group: string;

        if (groupAttr) {
          group = groupAttr[1];
        } else {
          const hash = crypto.createHash('md5');
          if (i >= 5 && tokens[i-5]) {
            hash.update(tokens[i-5].content);
          }
          if (i >= 4 && tokens[i-4]) {
            hash.update(tokens[i-4].content);
          }
          group = hash.update(tokens[i].content).digest('hex').slice(2, 7); // generate a deterministic group id
        }
        radioify(tokens[i], group, disableRadio, useLabelWrapper);
        attrSet(tokens[i - 2], 'class', 'radio-list-item');
        attrSet(parent, 'radio-group', group); // save the group id to the top-level list
        attrSet(parent, 'class', 'radio-list');
      }
    }
  });
}

function attrSet(token: Token, name: string, value: string): void {
  const index = token.attrIndex(name);
  const attr: [string, string] = [name, value];

  if (index < 0) {
    token.attrPush(attr);
  } else {
    if (token.attrs) {
      token.attrs[index] = attr;
    }
  }
}

function attrGet(token: Token, name: string): [string, string] | undefined {
  const index = token.attrIndex(name);

  if (index < 0 || !token.attrs) {
    return undefined;
  }
  return token.attrs[index] as [string, string];
}

function parentToken(tokens: Token[], index: number): number {
  const targetLevel = tokens[index].level - 1;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel) {
      return i;
    }
  }
  return -1;
}

function isTodoItem(tokens: Token[], index: number): boolean {
  return isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    isListItem(tokens[index - 2]) &&
    startsWithTodoMarkdown(tokens[index]);
}

function radioify(token: Token, radioId: string, disableRadio: boolean, useLabelWrapper: boolean): void {
  if (!token.children) token.children = [];

  token.children.unshift(makeRadioButton(token, radioId, disableRadio));
  token.children[1].content = token.children[1].content.slice(3);
  token.content = token.content.slice(3);

  if (useLabelWrapper) {
    // Removed beingLabel & endLabel functions since we can just use new Token(...) now.
    token.children.unshift(new Token('html_inline', '', 0));
    token.children[0].content = '<label>';
    
    token.children.push(new Token('html_inline', '', 0));
    token.children[token.children.length - 1].content = '</label>';
  }
}

function makeRadioButton(token: Token, radioId: string, disableRadio: boolean): Token {
  const radio = new Token('html_inline', '', 0);
  const disabledAttr = disableRadio ? ' disabled="" ' : '';
  
  const isUnchecked = token.content.indexOf('( ) ') === 0;
  const isChecked = token.content.indexOf('(x) ') === 0 ||
                    token.content.indexOf('(X) ') === 0;
  if (isUnchecked) {
    radio.content = `<input class="radio-list-input" name="${radioId}"${disabledAttr} type="radio">`;
  } else if (isChecked) {
    radio.content = `<input class="radio-list-input" checked="" name="${radioId}"${disabledAttr} type="radio">`;
  }
  return radio;
}

function isInline(token: Token): boolean { return token.type === 'inline'; }
function isParagraph(token: Token): boolean { return token.type === 'paragraph_open'; }
function isListItem(token: Token): boolean { return token.type === 'list_item_open'; }

function startsWithTodoMarkdown(token: Token): boolean {
  // leading whitespace in a list item is already trimmed off by markdown-it
  return token.content.indexOf('( ) ') === 0 || token.content.indexOf('(x) ') === 0 || token.content.indexOf('(X) ') === 0;
}
