const jsdiff = require('diff');

/**
 * Checks if fragment ends with an unclosed path
 * true: src="
 * false: src=""
 *        src="..."
 */
const endsWithUnclosedPath = (fragment) => {
  for (let i = fragment.length - 1; i > 4; i -= 1) {
    if (fragment[i] === '"') {
      if (fragment.substring(i - 4, i) === 'src=' || fragment.substring(i - 5, i) === 'href=') {
        return true;
      }
      return false;
    }
  }
  return false;
};

/**
 * Checks if the ending portion of the fragment is inside an html tag
 * true: <tag src=".../
 * false: <text> src="..
 *        <div/>
 */
const endsWithOpeningTag = (fragment) => {
  for (let i = fragment.length - 1; i >= 0; i -= 1) {
    if (fragment[i] === '<') {
      return true;
    }
    if (fragment[i] === '>') {
      return false;
    }
  }
  return false;
};

/**
 * Checks if the start portion of the fragment closes a path
 * Assumes that previous fragment was the start of or was within an unclosed path
 * true: "
 *       path/to/file.jpg"
 *       file.jpg" <
 * false: < src="...
 *        > "...
 */
const startsWithClosedPath = (fragment) => {
  for (let i = 0; i <= fragment.length - 1; i += 1) {
    if (fragment[i] === '<' || fragment[i] === '>') {
      return false;
    }
    if (fragment[i] === '"') {
      return true;
    }
  }
  return false;
};

/**
 * Checks if diff is a path separator character
 */
const isPathSeparatorDiff = diff => diff === '\\' || diff === '/';

/**
 * Checks for any diffs between expected.html and actual.html
 * @param {string} expected
 * @param {string} actual
 * @throws {Error} if any diffs that are not path separators are found
 */
const diffHtml = (expected, actual) => {
  let insidePath = false;

  const diff = jsdiff.diffChars(expected, actual);
  const isDiff = part => part.added || part.removed;

  // assumes no space between paths
  const isClosedPath = fragment =>
    insidePath
    && startsWithClosedPath(fragment);

  diff.forEach((part) => {
    if (isClosedPath(part.value)) {
      insidePath = false;
    }

    if (endsWithUnclosedPath(part.value) && endsWithOpeningTag(part.value)) {
      // Any diffs following this fragment will be diffs within a path
      insidePath = true;
    }

    if (isDiff(part) && !insidePath) {
      throw new Error(`Diff outside path!: '${part.value}'`);
    } else if (isDiff(part) && !isPathSeparatorDiff(part.value)) {
      throw new Error(`Diff in path!: '${part.value}'`);
    }
  });
};

module.exports = diffHtml;
