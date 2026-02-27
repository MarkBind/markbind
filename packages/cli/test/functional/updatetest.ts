import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import isError from 'lodash/isError';
import { ExecSyncOptions } from 'node:child_process';
import { cleanupConvert } from './testUtil/cleanup';

import {
  testSites,
  testConvertSites,
  testTemplateSites,
} from './testSites';

const _ = { isError };
const CLI_PATH = path.resolve(__dirname, '../../index');

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
    execSync(`node ${CLI_PATH} build ${siteName} ${siteName}/expected`, execOptions);
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
    execSync(`node ${CLI_PATH} init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ${CLI_PATH} build ${nonMarkBindSitePath} ${expectedOutputDirectory}`, execOptions);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err.message, siteName);
    } else {
      console.error(`Unknown error occurred ${err} for site ${siteName}`);
    }
    cleanupConvert(siteName);
    process.exit(1);
  }
  cleanupConvert(siteName);
});

testTemplateSites.forEach((templateAndSitePath) => {
  const flag = templateAndSitePath.split(',')[0];
  const sitePath = templateAndSitePath.split(',')[1];
  const siteCreationTempPath = path.join(sitePath, 'tmp');
  const expectedOutputDirectory = path.join(sitePath, 'expected');

  console.log(`Updating ${sitePath}`);
  try {
    execSync(`node ${CLI_PATH} init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ${CLI_PATH} build ${siteCreationTempPath} ${expectedOutputDirectory}`, execOptions);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err.message, sitePath);
    } else {
      console.error(`Unknown error occurred ${err} for site ${sitePath}`);
    }
    fs.removeSync(siteCreationTempPath);
    process.exit(1);
  }
  fs.removeSync(siteCreationTempPath);
});

console.log('Updated all test sites');
