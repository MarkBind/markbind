import findUp from 'find-up';
import fs from 'fs-extra';
import path from 'path';

import { SITE_CONFIG_NAME } from '@markbind/core/src/Site/constants';

export function findRootFolder(
  userSpecifiedRoot: string | undefined, siteConfigPath: string = SITE_CONFIG_NAME): string {
  if (userSpecifiedRoot) {
    const resolvedUserSpecifiedRoot = path.resolve(userSpecifiedRoot);
    const expectedConfigPath = path.join(resolvedUserSpecifiedRoot, siteConfigPath);
    if (!fs.existsSync(expectedConfigPath)) {
      throw new Error(`Config file not found at user specified root ${resolvedUserSpecifiedRoot}`);
    }
    return resolvedUserSpecifiedRoot;
  }

  const currentWorkingDir = process.cwd();
  // Enforces findUp uses value of process.cwd() to determine starting dir
  // This allows us to define starting dir when testing by mocking process.cwd()
  const foundConfigPath = findUp.sync(siteConfigPath, { cwd: currentWorkingDir });
  if (!foundConfigPath) {
    throw new Error(`No config file found in parent directories of ${currentWorkingDir}`);
  }
  return path.dirname(foundConfigPath);
}

export function cleanupFailedMarkbindBuild() {
  const markbindDir = path.join(process.cwd(), '_markbind');
  if (fs.pathExistsSync(markbindDir)) {
    // delete _markbind/ folder and contents
    fs.rmSync(markbindDir, { recursive: true, force: true });
  }
}
