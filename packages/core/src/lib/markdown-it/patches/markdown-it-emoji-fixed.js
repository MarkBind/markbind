// fix emoji numbers
const emojiData = require('markdown-it-emoji/lib/data/full.json');
// Extend emoji here

// Add keycap number emoji
emojiData['zero'] = '0️⃣';
emojiData['one'] = '1️⃣';
emojiData['two'] = '2️⃣';
emojiData['three'] = '3️⃣';
emojiData['four'] = '4️⃣';
emojiData['five'] = '5️⃣';
emojiData['six'] = '6️⃣';
emojiData['seven'] = '7️⃣';
emojiData['eight'] = '8️⃣';
emojiData['nine'] = '9️⃣';

module.exports = emojiData;