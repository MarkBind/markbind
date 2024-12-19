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
const danger_1 = require("danger");
const logger = __importStar(require("@markbind/core/src/utils/logger"));
const couplings = {
    'packages/core/src/html/CustomListIconProcessor.ts': [
        'docs/userGuide/syntax/lists.md',
        'packages/cli/test/functional/test_site/testList.md',
    ],
    'package.json': ['package-lock.json'],
};
const { git } = danger_1.danger;
Promise.resolve().then(() => {
    const allModifiedFiles = [...git.modified_files, ...git.created_files];
    const messages = [];
    Object.entries(couplings).forEach(([implementationFile, dependentFiles]) => {
        dependentFiles.forEach((dependentFile) => {
            if (allModifiedFiles.includes(implementationFile) && !allModifiedFiles.includes(dependentFile)) {
                messages.push(`Changes to ${implementationFile} should include changes to ${dependentFile}`);
            }
        });
    });
    if (messages.length > 0) {
        logger.warn(`Detected issues with file couplings:\n${messages.join('\n')}`);
        logger.warn('Please ensure implementation changes are accompanied '
            + 'by corresponding test or documentation updates.');
    }
    else {
        logger.info('All file couplings are correctly updated.');
    }
}).catch((err) => logger.error(err));
//# sourceMappingURL=dangerfile.js.map