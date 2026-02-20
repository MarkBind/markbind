import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import _ from 'lodash';
import { ExecSyncOptions } from 'node:child_process';
import { fileURLToPath } from 'url';
import { cleanupConvert } from './testUtil/cleanup.js';

import {
  testSites,
  testConvertSites,
  testTemplateSites,
} from './testSites.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* eslint-disable no-console */
function printFailedMessage(err: string, siteName: string) {
  console.log(err);
  console.log(`Failed to update: ${siteName}`);
}

process.env.TEST_MODE = String(true);
process.env.FORCE_COLOR = '3';

const execOptions: ExecSyncOptions = {
  stdio: ['inherit', 'inherit', 'inherit'],
};

testSites.forEach((siteName) => {
  console.log(`Updating ${siteName}`);
  try {
    execSync(`node ../../dist/index.js build ${siteName} ${siteName}/expected`, execOptions);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err.message, siteName);
    } else {
      console.error(`Unknown error occurred ${err} for site ${siteName}`);
    }
    process.exit(1);
  }
});

testConvertSites.forEach((siteName) => {
  console.log(`Updating ${siteName}`);
  const nonMarkBindSitePath = path.join(siteName, 'non_markbind_site');
  const expectedOutputDirectory = path.join(siteName, 'expected');
  try {
    execSync(`node ../../dist/index.js init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ../../dist/index.js build ${nonMarkBindSitePath} ${expectedOutputDirectory}`, execOptions);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err.message, siteName);
    } else {
      console.error(`Unknown error occurred ${err} for site ${siteName}`);
    }
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
    execSync(`node ../../dist/index.js init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ../../dist/index.js build ${siteCreationTempPath} ${expectedOutputDirectory}`,
             execOptions);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err.message, sitePath);
    } else {
      console.error(`Unknown error occurred ${err} for site ${sitePath}`);
    }
    fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
    process.exit(1);
  }
  fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
});

console.log('Updated all test sites');
