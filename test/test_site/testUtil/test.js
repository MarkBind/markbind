const diffHtml = require('./diffHtml');
const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');

const expectedPaths = walkSync('./expected', { directories: false });
const actualPaths = walkSync('./_site', { directories: false });

if (expectedPaths.length !== actualPaths.length) {
  throw new Error('Unequal number of files');
}

for (let i = 0; i < expectedPaths.length; i += 1) {
  const expectedFilePath = expectedPaths[i];
  const actualFilePath = actualPaths[i];

  if (expectedFilePath !== actualFilePath) {
    throw new Error('Different files built');
  }

  // compare html files only
  if (path.parse(actualFilePath).ext === '.html') {
    const resolvedExpectedFilePath = path.resolve('./expected', expectedFilePath);
    const resolvedActualFilePath = path.resolve('./_site', actualFilePath);
    const expected = fs.readFileSync(resolvedExpectedFilePath, 'utf8');
    const actual = fs.readFileSync(resolvedActualFilePath, 'utf8');
    try {
      diffHtml(expected, actual);
    } catch (err) {
      throw new Error(`${err.message} in ${expectedFilePath}`);
    }
  }
}
