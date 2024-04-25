import { danger } from 'danger';
import * as logger from '@markbind/core/src/utils/logger';

interface Couplings {
  [key: string]: string[];
}

const couplings: Couplings = {
  'packages/core/src/html/CustomListIconProcessor.ts': [
    'docs/userGuide/syntax/lists.md',
    'packages/cli/test/functional/test_site/testList.md',
  ],
  'package.json': ['package-lock.json'],
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
    logger.warn(`Detected issues with file couplings:\n${messages.join('\n')}`);
    logger.warn('Please ensure implementation changes are accompanied '
     + 'by corresponding test or documentation updates.');
  } else {
    logger.info('All file couplings are correctly updated.');
  }
}).catch((err: Error) => logger.error(err));
