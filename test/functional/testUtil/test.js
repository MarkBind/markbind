const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');
const diffHtml = require('./diffHtml');

const _ = {};
_.isEqual = require('lodash/isEqual');

function readFileSync(...paths) {
  return fs.readFileSync(path.resolve(...paths), 'utf8');
}

const sitePath = process.argv[2];
const expectedDirectory = path.join(sitePath, 'expected');
const actualDirectory = path.join(sitePath, '_site');

const expectedPaths = walkSync(expectedDirectory, { directories: false });
const actualPaths = walkSync(actualDirectory, { directories: false });

let error = false;
if (expectedPaths.length !== actualPaths.length) {
  throw new Error('Unequal number of files');
}

for (let i = 0; i < expectedPaths.length; i += 1) {
  const expectedFilePath = expectedPaths[i];
  const actualFilePath = actualPaths[i];

  if (expectedFilePath !== actualFilePath) {
    throw new Error('Different files built');
  }

  const parsed = path.parse(actualFilePath);
  if (parsed.ext === '.html') {
    // compare html files
    const expected = readFileSync(expectedDirectory, expectedFilePath);
    const actual = readFileSync(actualDirectory, actualFilePath);
    const hasDiff = diffHtml(expected, actual, expectedFilePath);
    error = error || hasDiff;
  } else if (parsed.base === 'siteData.json') {
    // compare site data
    const expected = readFileSync(expectedDirectory, expectedFilePath);
    const actual = readFileSync(actualDirectory, actualFilePath);
    if (!_.isEqual(JSON.parse(expected), JSON.parse(actual))) {
      throw new Error('Site data does not match with the expected file.');
    }
  }
}

if (error) throw new Error('Diffs found in .html files');
