import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { compare } from './testUtil/compare';
import { cleanupConvert } from './testUtil/cleanup';
import isError from 'lodash/isError';
import * as logger from '@markbind/core/src/utils/logger';
import {
  testSites,
  testConvertSites,
  testTemplateSites,
  plantumlGeneratedFilesForTestSites,
  plantumlGeneratedFilesForConvertSites,
  plantumlGeneratedFilesForTemplateSites,
} from './testSites';
import {ExecSyncOptions} from "node:child_process";
const _ = { isError }
// Path to the compiled CLI executable
const CLI_PATH = path.resolve(__dirname, '../../dist/index.js');
/* eslint-disable no-console */

function printFailedMessage(err: Error, siteName: string) {
  console.log(err);
  console.log(`Test result: ${siteName} FAILED`);
}

process.env.TEST_MODE = 'true';
process.env.FORCE_COLOR = '3';

const execOptions: ExecSyncOptions = {
  stdio: ['inherit', 'inherit', 'inherit'],
};

const expectedErrors = [
  "URLs are not allowed in the 'src' attribute",
  'No config file found in parent directories of',
  'This directory does not appear to contain a valid MarkBind site.'
  + ' Check that you are running the command in the correct directory!',
];

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
    execSync(`node ${CLI_PATH} build ${siteName}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForTestSites[siteName];
    compare(siteName, 'expected', '_site', siteIgnoredFiles);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err, siteName);
    } else {
      console.error(`Unknown error for site ${siteName} occurred: ${err}`)
    }
    process.exit(1);
  }
});

testConvertSites.forEach((sitePath) => {
  console.log(`Running ${sitePath} tests`);
  const nonMarkBindSitePath = path.join(sitePath, 'non_markbind_site');
  const siteName = sitePath.split('/')[1];
  try {
    execSync(`node ${CLI_PATH} init ${nonMarkBindSitePath} -c`, execOptions);
    execSync(`node ${CLI_PATH} build ${nonMarkBindSitePath}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForConvertSites[siteName];
    compare(sitePath, 'expected', 'non_markbind_site/_site', siteIgnoredFiles);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err, sitePath);
    } else {
      console.error(`Unknown error for site ${sitePath} occurred: ${err}`)
    }
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
    execSync(`node ${CLI_PATH} init ${siteCreationTempPath} --template ${flag}`, execOptions);
    execSync(`node ${CLI_PATH} build ${siteCreationTempPath}`, execOptions);
    const siteIgnoredFiles = plantumlGeneratedFilesForTemplateSites[siteName];
    compare(sitePath, 'expected', 'tmp/_site', siteIgnoredFiles);
  } catch (err) {
    if (_.isError(err)) {
      printFailedMessage(err, sitePath);
    } else {
      console.error(`Unknown error for site ${sitePath} occurred: ${err}`)
    }
    fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
    process.exit(1);
  }
  fs.removeSync(path.resolve(__dirname, siteCreationTempPath));
});

function testEmptyDirectoryBuild() {
  const siteRootName = 'test_site_empty';
  const siteRootPath = path.join(__dirname, siteRootName);

  const emptySiteName = 'empty_dir';
  const emptySitePath = path.join(siteRootPath, emptySiteName);

  const expectedSiteName = 'expected';
  const expectedSitePath = path.join(siteRootPath, expectedSiteName);

  const execOptionsWithCwd: ExecSyncOptions = {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: emptySitePath, // Set the working directory to testEmptyPath
  };

  console.log(`Running ${siteRootName} test`);

  try {
    // Ensure test_site_empty/empty_dir and test_site_empty/expected directories exist
    fs.ensureDirSync(emptySitePath);
    fs.ensureDirSync(expectedSitePath);

    // Try to build in empty directory (should fail with specific error)
    try {
      execSync(`node ${CLI_PATH} build ${emptySitePath}`, execOptionsWithCwd);
      printFailedMessage(new Error('Expected build to fail but it succeeded'), siteRootName);
      process.exit(1);
    } catch (err) {
      // Verify that test_empty directory remains empty using compare()
      try {
        compare(siteRootName, 'expected', 'empty_dir', [], true);
      } catch (compareErr) {
        if (_.isError(compareErr)) {
          printFailedMessage(compareErr, siteRootName);
        } else {
          console.error(`Unknown error for site ${siteRootName} occurred: ${compareErr}`)
        }
        // Reset test_site_empty/empty_dir
        fs.emptyDirSync(emptySitePath);
        process.exit(1);
      }
    }
  } finally {
    // Reset test_site_empty/empty_dir
    fs.emptyDirSync(emptySitePath);
  }
}

// Run the empty directory test
testEmptyDirectoryBuild();

console.log('Test result: PASSED');
