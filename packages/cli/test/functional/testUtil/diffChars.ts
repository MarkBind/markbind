import { ChangeObject, diffChars } from 'diff';
import { DiffPrinter } from './diffPrinter';

/**
 * Checks for any diffs between expected.html and actual.html,
 * then prints the differences.
 * @param {string} expected
 * @param {string} actual
 * @param {string} filePathName
 * @returns {boolean} if diff was found
 */
const diffCharsAndPrint = (expected: string, actual: string, filePathName: string) => {
  const diffParts = diffChars(expected, actual);
  const isDiff = ((part: ChangeObject<string>) => part.added || part.removed);
  const hasDiff = diffParts.some(isDiff);
  if (hasDiff) {
    DiffPrinter.printDiffFoundMessage(filePathName);
    DiffPrinter.printDiff(diffParts);
  }
  return hasDiff;
};

export { diffCharsAndPrint };
