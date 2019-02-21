const jsdiff = require('diff');
const DiffPrinter = require('./diffPrinter');

/**
 * Checks for any diffs between expected.html and actual.html
 * @param {string} expected
 * @param {string} actual
 * @param {string} filePathName
 * @returns {bool} if diff was found
 */
const diffHtml = (expected, actual, filePathName) => {
  const diffParts = jsdiff.diffWords(expected, actual);
  const isDiff = part => part.added || part.removed;
  const hasDiff = diffParts.some(isDiff);
  if (hasDiff) {
    DiffPrinter.printLine();
    DiffPrinter.printLine('-------------------------------------', 'grey');
    DiffPrinter.printLine(`Diff found in ${filePathName}`, 'grey');
    DiffPrinter.printLine();
    DiffPrinter.printDiff(diffParts);
  }
  return hasDiff;
};

module.exports = diffHtml;
