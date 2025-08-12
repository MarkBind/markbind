/* eslint-disable no-console */
import { danger } from 'danger';

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
    console.warn(`WARN: Detected issues with file couplings:\n${messages.join('\n')}`);
    console.warn('WARN: Please ensure implementation changes are accompanied '
     + 'by corresponding test or documentation updates.');
  } else {
    // JUST FOR TESTING COLOR:
    console.error('ERR: test error');
    console.warn('WARN: test');
    console.info('info: All file couplings are correctly updated.');
  }
}).catch((err: Error) => console.error(err));
