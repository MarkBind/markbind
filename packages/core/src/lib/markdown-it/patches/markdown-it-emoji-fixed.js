"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rawData = fs.readFileSync(path.resolve(__dirname, '../../../../../../node_modules/markdown-it-emoji/lib/data/full.json'));
const emojiData = JSON.parse(rawData.toString());
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
exports.default = emojiData;
//# sourceMappingURL=markdown-it-emoji-fixed.js.map