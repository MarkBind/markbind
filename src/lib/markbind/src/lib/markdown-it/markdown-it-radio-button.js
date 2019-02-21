const crypto = require('crypto');

var disableRadio = false;
var useLabelWrapper = true;

/**
 * Modified from https://github.com/revin/markdown-it-task-lists/blob/master/index.js
 */
module.exports = function(md, options) {
  if (options) {
    disableRadio = !options.enabled;
    useLabelWrapper = !!options.label;
  }

  md.core.ruler.after('inline', 'radio-lists', function(state) {
    var tokens = state.tokens;
    for (var i = 2; i < tokens.length; i++) {
      if (isTodoItem(tokens, i)) {
        var group = attrGet(tokens[parentToken(tokens, i-2)], 'radio-group'); // try retrieve the group id
        if (group) {
          group = group[1];
        } else {
          group = crypto.createHash('md5')
                        .update(tokens[i-5].content)
                        .update(tokens[i-4].content)
                        .update(tokens[i].content).digest('hex').substr(2, 5); // generate a deterministic group id
        }
        radioify(tokens[i], state.Token, group);
        attrSet(tokens[i-2], 'class', 'radio-list-item');
        attrSet(tokens[parentToken(tokens, i-2)], 'radio-group', group); // save the group id to the top-level list
        attrSet(tokens[parentToken(tokens, i-2)], 'class', 'radio-list');
      }
    }
  });
};

function attrSet(token, name, value) {
  var index = token.attrIndex(name);
  var attr = [name, value];

  if (index < 0) {
    token.attrPush(attr);
  } else {
    token.attrs[index] = attr;
  }
}

function attrGet(token, name) {
  var index = token.attrIndex(name);

  if (index < 0) {
    return void(0);
  } else {
    return token.attrs[index];
  }
}

function parentToken(tokens, index) {
  var targetLevel = tokens[index].level - 1;
  for (var i = index - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel) {
      return i;
    }
  }
  return -1;
}

function isTodoItem(tokens, index) {
  return isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    isListItem(tokens[index - 2]) &&
    startsWithTodoMarkdown(tokens[index]);
}

function radioify(token, TokenConstructor, radioId) {
  token.children.unshift(makeRadioButton(token, TokenConstructor, radioId));
  token.children[1].content = token.children[1].content.slice(3);
  token.content = token.content.slice(3);

  if (useLabelWrapper) {
    token.children.unshift(beginLabel(TokenConstructor));
    token.children.push(endLabel(TokenConstructor));
  }
}

function makeRadioButton(token, TokenConstructor, radioId) {
  var radio = new TokenConstructor('html_inline', '', 0);
  var disabledAttr = disableRadio ? ' disabled="" ' : '';
  if (token.content.indexOf('( ) ') === 0) {
    radio.content = '<input class="radio-list-input" name="' + radioId + '"' + disabledAttr + 'type="radio">';
  } else if (token.content.indexOf('(x) ') === 0 || token.content.indexOf('(X) ') === 0) {
    radio.content = '<input class="radio-list-input" checked="" name="' + radioId + '"' + disabledAttr + 'type="radio">';
  }
  return radio;
}

// these next two functions are kind of hacky; probably should really be a
// true block-level token with .tag=='label'
function beginLabel(TokenConstructor) {
  var token = new TokenConstructor('html_inline', '', 0);
  token.content = '<label>';
  return token;
}

function endLabel(TokenConstructor) {
  var token = new TokenConstructor('html_inline', '', 0);
  token.content = '</label>';
  return token;
}

function isInline(token) { return token.type === 'inline'; }
function isParagraph(token) { return token.type === 'paragraph_open'; }
function isListItem(token) { return token.type === 'list_item_open'; }

function startsWithTodoMarkdown(token) {
  // leading whitespace in a list item is already trimmed off by markdown-it
  return token.content.indexOf('( ) ') === 0 || token.content.indexOf('(x) ') === 0 || token.content.indexOf('(X) ') === 0;
}
