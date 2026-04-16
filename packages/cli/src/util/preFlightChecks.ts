import * as semver from 'semver';
import * as logger from './logger.js';
import packageJson from '../../package.json' with { type: 'json' };

const CLI_VERSION = packageJson.version;

function checkNode() {
  const nodeVersion = process.version;
  const version = nodeVersion.slice(1);

  if (semver.lt(version, '22.12.0')) {
    logger.error(
      `Markbind ${CLI_VERSION} requires Node >=22.12.0. `
        + 'Please update Node or use an older version of MarkBind!'
    );
    process.exit(1);
  }
}

export function preFlightChecks() {
  checkNode();
}
