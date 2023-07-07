import * as fs from 'fs';
import * as path from 'path';

const rawData = fs.readFileSync(path.resolve(__dirname, '../../../../../../node_modules/markdown-it-emoji/lib/data/full.json'));
const emojiData: { [key: string]: string } = JSON.parse(rawData.toString());

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

export default emojiData;