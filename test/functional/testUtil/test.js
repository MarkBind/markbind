const fs = require('fs');
const path = require('path');
const program = require('commander');
const ignore = require('ignore');
const walkSync = require('walk-sync');
const { isBinary } = require('istextorbinary');
const diffChars = require('./diffChars');

const _ = {};
_.isEqual = require('lodash/isEqual');

// Other files to ignore / files with binary extensions not recognised by istextorbinary package
const TEST_BLACKLIST = ignore().add([
  '*.log',
  '*.woff',
  '*.woff2',
]);

// Files that possibly have null characters but are not binary files
const NULL_WHITELIST = ignore().add(['vue-strap.min.js']);

const CRLF_REGEX = new RegExp('\\r\\n', 'g');

function readFileSync(...paths) {
  return fs.readFileSync(path.resolve(...paths), 'utf8');
}

program
  .command('compare [root]')
  .option('-s, --sitePath <path>', 'path to site directory', '_site')
  .option('-e, --expectedPath <type>', 'path to expected directory', 'expected')
  .action((root, options) => {
    const expectedDirectory = path.join(root, options.expectedPath);
    const actualDirectory = path.join(root, options.sitePath);

    const expectedPaths = walkSync(expectedDirectory, { directories: false });
    const actualPaths = walkSync(actualDirectory, { directories: false });

    let error = false;
    if (expectedPaths.length !== actualPaths.length) {
      throw new Error('Unequal number of files');
    }

    /* eslint-disable no-continue */
    for (let i = 0; i < expectedPaths.length; i += 1) {
      const expectedFilePath = expectedPaths[i];
      const actualFilePath = actualPaths[i];

      if (expectedFilePath !== actualFilePath) {
        throw new Error('Different files built');
      }

      if (isBinary(expectedFilePath) || TEST_BLACKLIST.ignores(expectedFilePath)) {
        continue;
      }

      const expected = readFileSync(expectedDirectory, expectedFilePath).replace(CRLF_REGEX, '\n');
      const actual = readFileSync(actualDirectory, actualFilePath).replace(CRLF_REGEX, '\n');

      if (!NULL_WHITELIST.ignores(expectedFilePath) && isBinary(null, expected)) {
        // eslint-disable-next-line no-console
        console.warn(`Unrecognised file extension ${expectedFilePath} contains null characters, skipping`);
        continue;
      }

      const hasDiff = diffChars(expected, actual, expectedFilePath);
      error = error || hasDiff;
    }
    /* eslint-enable no-continue */

    if (error) throw new Error('Diffs found in files');
  });

program.parse(process.argv);
