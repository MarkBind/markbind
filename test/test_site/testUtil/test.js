const diffHtml = require('./diffHtml');
const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');

const _ = {};
_.isEqual = require('lodash/isEqual');

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

  // compare html files and site data
  if (path.parse(actualFilePath).ext === '.html' || actualFilePath.includes('siteData.json')) {
    const resolvedExpectedFilePath = path.resolve('./expected', expectedFilePath);
    const resolvedActualFilePath = path.resolve('./_site', actualFilePath);
    const expected = fs.readFileSync(resolvedExpectedFilePath, 'utf8');
    const actual = fs.readFileSync(resolvedActualFilePath, 'utf8');
    if (actualFilePath.includes('siteData.json')) {
      if (!_.isEqual(JSON.parse(expected), JSON.parse(actual))) {
        throw new Error('Site data does not match with the expected file.');
      }
    } else {
      try {
        diffHtml(expected, actual);
      } catch (err) {
        throw new Error(`${err.message} in ${expectedFilePath}`);
      }
    }
  }
}
