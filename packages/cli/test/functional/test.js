const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');

const { compare } = require('./testUtil/compare');

const { cleanupConvert } = require('./testUtil/cleanup');

const logger = require('../../../core/src/utils/logger');

const {
  testSites,
  testConvertSites,
  testTemplateSites,
  plantumlGeneratedFilesForTestSites,
  plantumlGeneratedFilesForConvertSites,
  plantumlGeneratedFilesForTemplateSites,
} = require('./testSites');

/* eslint-disable no-console */

function printFailedMessage(err, siteName) {
  console.log(err);
  console.log(`Test result: ${siteName} FAILED`);
}

process.env.TEST_MODE = true;
process.env.FORCE_COLOR = '3';

const execOptions = {
  stdio: ['inherit', 'inherit', 'inherit'],
};

const expectedErrors = ["URLs are not allowed in the 'src' attribute"];

logger.info(
  `The following ${
    expectedErrors.length === 1 ? 'error is' : 'errors are'
  } expected to be thrown during the test run:`,
);

expectedErrors.forEach((error, index) => {
  logger.info(`${index + 1}: ${error}`);
});

testSites.forEach((siteName) => {
  console.log(`Running ${siteName} tests`);
  try {
    execSync(`node ../../index.js build ${siteName}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForTestSites[siteName];
    compare(siteName, 'expected', '_site', siteIgnoredFiles);
  } catch (err) {
    printFailedMessage(err, siteName);
    process.exit(1);
  }
});

testConvertSites.forEach((sitePath) => {
  console.log(`Running ${sitePath} tests`);
  const nonMarkBindSitePath = path.join(sitePath, 'non_markbind_site');
  const siteName = sitePath.split('/')[1];
  try {
    execSync(`node ../../index.js init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ../../index.js build ${nonMarkBindSitePath}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForConvertSites[siteName];
    compare(sitePath, 'expected', 'non_markbind_site/_site', siteIgnoredFiles);
  } catch (err) {
    printFailedMessage(err, sitePath);
    cleanupConvert(path.resolve(__dirname, sitePath));
    process.exit(1);
  }
  cleanupConvert(path.resolve(__dirname, sitePath));
});

testTemplateSites.forEach((templateAndSitePath) => {
  const flag = templateAndSitePath.split(',')[0];
  const sitePath = templateAndSitePath.split(',')[1];
  const siteCreationTempPath = path.join(sitePath, 'tmp');
  const siteName = sitePath.split('/')[1];

  console.log(`Running ${sitePath} tests`);
  try {
    execSync(`node ../../index.js init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ../../index.js build ${siteCreationTempPath}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForTemplateSites[siteName];
    compare(sitePath, 'expected', 'tmp/_site', siteIgnoredFiles);
  } catch (err) {
    printFailedMessage(err, sitePath);
    fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
    process.exit(1);
  }
  fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
});

console.log('Test result: PASSED');
