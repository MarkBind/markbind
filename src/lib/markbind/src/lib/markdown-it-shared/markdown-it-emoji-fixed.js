// fix emoji numbers
const emojiData = require('markdown-it-emoji/lib/data/full.json');
// Extend emoji here

// Add number key cap emoji
const unicodes = '0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣'.split(' ');
const letters = 'zero one two three four five six seven eight nine'.split(' ');

letters.forEach((letter, index) => {
  emojiData[letter] = unicodes[index];
});

module.exports = emojiData;
