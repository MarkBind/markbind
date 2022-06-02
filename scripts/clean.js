/*
 * Script for cleaning compiled TypeScript files
 *
 * This script is a manual substitute of the `tsc --build --clean`
 * command which can handle the case where the TypeScript file
 * that generated its associated compiled files has been removed
 * prior to cleaning.
 *
 * The script assumes that the associated compiled files can be
 * detected through the presence of sourcemap files (`.js.map`)
 * instead.
 */

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const walkSync = require('walk-sync');

const JS_MAP_RE = /\.js\.map$/;
const COMPILED_FILES_EXTS = ['.d.ts', '.d.ts.map', '.js', '.js.map'];

const packagesDir = path.join(__dirname, '../packages');

const jsMapFiles = walkSync(packagesDir, {
  globs: ['**/*.js.map'],
  ignore: ['**/node_modules'],
  directories: false,
  includeBasePath: true,
});

function removeFile(file) {
  try {
    fs.rmSync(file);
  } catch (err) {
    // No need to error when file is not found
    if (err.code === 'ENOENT') {
      return;
    }

    throw err;
  }
}

jsMapFiles.forEach((jsMapFile) => {
  COMPILED_FILES_EXTS.forEach((ext) => {
    const extFile = jsMapFile.replace(JS_MAP_RE, ext);
    removeFile(extFile);
  });
});
