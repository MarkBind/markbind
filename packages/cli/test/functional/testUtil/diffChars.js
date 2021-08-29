const jsdiff = require('diff');
const DiffPrinter = require('./diffPrinter');

/**
 * Checks for any diffs between expected.html and actual.html,
 * then prints the differences.
 * @param {string} expected
 * @param {string} actual
 * @param {string} filePathName
 * @returns {boolean} if diff was found
 */
const diffCharsAndPrint = (expected, actual, filePathName) => {
  const diffParts = jsdiff.diffChars(expected, actual);
  const isDiff = part => part.added || part.removed;
  const hasDiff = diffParts.some(isDiff);
  if (hasDiff) {
    console.log(actual);

    // DiffPrinter.printDiffFoundMessage(filePathName);
    // DiffPrinter.printDiff(diffParts);
  }
  return hasDiff;
};

module.exports = diffCharsAndPrint;
