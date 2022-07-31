// This file should be ignored since it is included in the "ignore" array of the site.json
// Due to "testFileIgnore/*"

const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');
const diffHtml = require('./diffHtml');

const _ = {};
_.isEqual = require('lodash/isEqual');

function readFileSync(...paths) {
  return fs.readFileSync(path.resolve(...paths), 'utf8');
}

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

  const parsed = path.parse(actualFilePath);
  if (parsed.ext === '.html') {
    // compare html files
    const expected = readFileSync('./expected', expectedFilePath);
    const actual = readFileSync('./_site', actualFilePath);
    try {
      diffHtml(expected, actual);
    } catch (err) {
      throw new Error(`${err.message} in ${expectedFilePath}`);
    }
  } else if (parsed.base === 'siteData.json') {
    // compare site data
    const expected = readFileSync('./expected', expectedFilePath);
    const actual = readFileSync('./_site', actualFilePath);
    if (!_.isEqual(JSON.parse(expected), JSON.parse(actual))) {
      throw new Error('Site data does not match with the expected file.');
    }
  }
}
