const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');

const { compare } = require('./testUtil/compare');
const { cleanupConvert } = require('./testUtil/cleanup');

const {
  testSites,
  testConvertSites,
  testTemplateSites,
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

testSites.forEach((siteName) => {
  console.log(`Running ${siteName} tests`);
  try {
    execSync(`node ../../index.js build ${siteName}`, execOptions);
    compare(siteName);
  } catch (err) {
    printFailedMessage(err, siteName);
    process.exit(1);
  }
});

testConvertSites.forEach((siteName) => {
  console.log(`Running ${siteName} tests`);
  const nonMarkBindSitePath = path.join(siteName, 'non_markbind_site');
  try {
    execSync(`node ../../index.js init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ../../index.js build ${nonMarkBindSitePath}`, execOptions);
    compare(siteName, 'expected', 'non_markbind_site/_site');
  } catch (err) {
    printFailedMessage(err, siteName);
    cleanupConvert(path.resolve(__dirname, siteName));
    process.exit(1);
  }
  cleanupConvert(path.resolve(__dirname, siteName));
});

testTemplateSites.forEach((templateAndSitePath) => {
  const flag = templateAndSitePath.split(',')[0];
  const sitePath = templateAndSitePath.split(',')[1];
  const siteCreationTempPath = path.join(sitePath, 'tmp');

  console.log(`Running ${sitePath} tests`);
  try {
    execSync(`node ../../index.js init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ../../index.js build ${siteCreationTempPath}`, execOptions);
    compare(sitePath, 'expected', 'tmp/_site');
  } catch (err) {
    printFailedMessage(err, sitePath);
    fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
    process.exit(1);
  }
  fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
});

console.log('Test result: PASSED');
