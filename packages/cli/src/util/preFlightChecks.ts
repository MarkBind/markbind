import * as semver from 'semver';
import * as logger from './logger.js';
import packageJson from '../../package.json' with { type: 'json' };

const CLI_VERSION = packageJson.version;
const REQUIRED_NODE_VERSION = '22.12.0';

function checkNode() {
  const nodeVersion = process.version;
  const version = semver.coerce(nodeVersion);

  if (version === null) {
    logger.warn('Unknown version of node detected.');
    return;
  }
  if (semver.lt(version, REQUIRED_NODE_VERSION)) {
    logger.error(
      `Markbind ${CLI_VERSION} requires node >=${REQUIRED_NODE_VERSION}. `
        + 'Please update node or use an older version of Markbind!',
    );
    process.exit(1);
  }
}

export function preFlightChecks() {
  checkNode();
}
