// fix emoji numbers
const emojiData = require('markdown-it-emoji/lib/data/full.json');
// Extend emoji here
emojiData['zero'] = emojiData['0'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0030-20e3.png">';
emojiData['one'] = emojiData['1'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0031-20e3.png">';
emojiData['two'] = emojiData['2'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0032-20e3.png">';
emojiData['three'] = emojiData['3'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0033-20e3.png">';
emojiData['four'] = emojiData['4'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0034-20e3.png">';
emojiData['five'] = emojiData['5'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0035-20e3.png">';
emojiData['six'] = emojiData['6'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0036-20e3.png">';
emojiData['seven'] = emojiData['7'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0037-20e3.png">';
emojiData['eight'] = emojiData['8'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0038-20e3.png">';
emojiData['nine'] = emojiData['9'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0039-20e3.png">';

module.exports = emojiData;