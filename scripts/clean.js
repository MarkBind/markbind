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
 * instead. I.e. It looks for `.js.map` files, and assumes
 * that every `.js`/`.d.ts` with the same base name should be
 * deleted.
 */

const fs = require('fs');
const path = require('path');

const JS_MAP_RE = /\.js\.map$/;
const COMPILED_FILES_EXTS = ['.d.ts', '.d.ts.map', '.js', '.js.map'];

const packagesDir = path.join(__dirname, '../packages');
const currentDir = __dirname;

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

function cleanDir(dir) {
  const jsMapFilePaths = fs.globSync('**/*.js.map', {
    cwd: dir,
    exclude: ['**/node_modules/**'],
  }).map(file => path.join(dir, file));

  jsMapFilePaths.forEach((jsMapFilePath) => {
    const compiledFilePaths = COMPILED_FILES_EXTS.map(ext => jsMapFilePath.replace(JS_MAP_RE, ext));
    compiledFilePaths.forEach(removeFile);
  });
}

cleanDir(packagesDir);
cleanDir(currentDir);
