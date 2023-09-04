const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');

const { cleanupConvert } = require('./testUtil/cleanup');

const {
  testSites,
  testConvertSites,
  testTemplateSites,
} = require('./testSites');

/* eslint-disable no-console */

function printFailedMessage(err, siteName) {
  console.log(err);
  console.log(`Failed to update: ${siteName}`);
}

process.env.TEST_MODE = true;
process.env.FORCE_COLOR = '3';

const execOptions = {
  stdio: ['inherit', 'inherit', 'inherit'],
};

testSites.forEach((siteName) => {
  console.log(`Updating ${siteName}`);
  try {
    execSync(`node ../../index.js build ${siteName} ${siteName}/expected`, execOptions);
  } catch (err) {
    printFailedMessage(err, siteName);
    process.exit(1);
  }
});

testConvertSites.forEach((siteName) => {
  console.log(`Updating ${siteName}`);
  const nonMarkBindSitePath = path.join(siteName, 'non_markbind_site');
  const expectedOutputDirectory = path.join(siteName, 'expected');
  try {
    execSync(`node ../../index.js init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ../../index.js build ${nonMarkBindSitePath} ${expectedOutputDirectory}`, execOptions);
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
  const expectedOutputDirectory = path.join(sitePath, 'expected');

  console.log(`Updating ${sitePath}`);
  try {
    execSync(`node ../../index.js init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ../../index.js build ${siteCreationTempPath} ${expectedOutputDirectory}`, execOptions);
  } catch (err) {
    printFailedMessage(err, sitePath);
    fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
    process.exit(1);
  }
  fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
});

console.log('Updated all test sites');
