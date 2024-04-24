import { danger } from 'danger';
import * as logger from '@markbind/core/src/utils/logger';

interface Couplings {
  [key: string]: string[];
}

const couplings: Couplings = {
  '.github/workflows/check-file-diff.yml': [
    'package.json',
    'babel.config.js',
  ],
  'babel.config.js': [
    'package.json',
    'lerna.json',
  ],
};

const { git } = danger;

Promise.resolve().then(() => {
  const allModifiedFiles = [...git.modified_files, ...git.created_files];
  const messages: string[] = [];

  Object.entries(couplings).forEach(([implementationFile, dependentFiles]) => {
    dependentFiles.forEach((dependentFile) => {
      if (allModifiedFiles.includes(implementationFile) && !allModifiedFiles.includes(dependentFile)) {
        messages.push(`Changes to ${implementationFile} should include changes to ${dependentFile}`);
      }
    });
  });

  if (messages.length > 0) {
    logger.info(`Detected issues with file couplings:\n${messages.join('\n')}`);
    logger.info('Please ensure implementation changes are accompanied '
     + 'by corresponding test or documentation updates.');
  } else {
    logger.info('All file couplings are correctly updated.');
  }
}).catch((err: Error) => logger.error(err));
