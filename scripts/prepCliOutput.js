/*
 * Script to ensure that the build CLI project's entrypoint is executable
 *
 * This script exists largely due to an issue in TypeScript that
 * has been open for 5 years: https://github.com/microsoft/TypeScript/issues/37583
 * TypeScript's compiler does not respect source files'
 * permissions, and always outputs all generated files
 * with read permissions only.
 *
 * This is a cross-platform solution that works with both --watch and --build
 * workflows. By ensuring that a CLI_OUTPUT_FILE is present (even if it's empty),
 * we can set the file's permissions expressly, after which
 * TypeScript will simply populate the file as needed, preserving write perms.
 */

const fs = require('fs');
const path = require('path');

const CLI_OUTPUT_FILE = 'packages/cli/dist/index.js';
const ERROR_TEXT = 'prepCliOutput script failed - you may have to '
+ `manually add permissions to execute the generated file in ${CLI_OUTPUT_FILE}`;

function tryAddPerms() {
  if (!fs.existsSync(CLI_OUTPUT_FILE)) {
    try {
      fs.mkdirSync(path.dirname(CLI_OUTPUT_FILE), { recursive: true });
      fs.writeFileSync(CLI_OUTPUT_FILE, '');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(ERROR_TEXT);
      return;
    }
  }
  // Set execute permissions
  try {
    fs.chmodSync(CLI_OUTPUT_FILE, '755');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(ERROR_TEXT);
  }
}

tryAddPerms();
