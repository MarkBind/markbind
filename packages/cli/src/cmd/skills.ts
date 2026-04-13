import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';

import * as logger from '../util/logger.js';
import packageJson from '../../package.json' with { type: 'json' };

const execFileAsync = promisify(execFile);

const METADATA_FILE = '.markbind-skills.json';
const SKILLS_REPO = 'https://github.com/MarkBind/skills.git';
const SKILLS_TARGET = path.join('.agents', 'skills');
const SKILL_MARKER = 'SKILL.md';
const CLONE_TIMEOUT_MS = 30000;

interface SkillsInstallOptions {
  ref?: string;
  force?: boolean;
  agents?: string[];
}

interface SkillsMetadata {
  ref: string;
  skills: string[];
  installedAt: string;
}

async function findSkillDirs(baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) return null;
      const skillMdPath = path.join(baseDir, entry.name, SKILL_MARKER);
      if (await fs.pathExists(skillMdPath)) return entry.name;
      return null;
    }),
  );
  return results
    .filter((name): name is string => name !== null)
    .sort((a, b) => a.localeCompare(b));
}

async function writeMetadata(targetDir: string, skillsRef: string, skillNames: string[]) {
  const metadata: SkillsMetadata = {
    ref: skillsRef,
    skills: skillNames,
    installedAt: new Date().toISOString(),
  };
  const metadataPath = path.join(targetDir, METADATA_FILE);
  await fs.writeJson(metadataPath, metadata, { spaces: 2 });
}

async function readMetadata(targetDir: string): Promise<SkillsMetadata> {
  const metadataPath = path.join(targetDir, METADATA_FILE);
  if (await fs.pathExists(metadataPath)) {
    try {
      return await fs.readJson(metadataPath);
    } catch (e) {
      throw new Error(`Failed to read metadata file: ${(e as Error).message}`);
    }
  } else {
    throw new Error('Metadata file not found');
  }
}

function isSemverTag(ref: string): boolean {
  return /^v\d+\.\d+\.\d+$/.test(ref);
}

// Expects versions in format vX.Y.Z or X.Y.Z, compares them numerically
function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => v.replace('v', '')
    .split('.')
    .map(num => parseInt(num, 10));
  const v1Parsed = parse(v1);
  const v2Parsed = parse(v2);
  for (let i = 0; i < Math.max(v1Parsed.length, v2Parsed.length); i += 1) {
    const num1 = v1Parsed[i] || 0;
    const num2 = v2Parsed[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function install(options: SkillsInstallOptions) {
  const ref = options.ref || `v${packageJson.aiSkillsVersion}`;
  const targetDir = path.resolve(process.cwd(), SKILLS_TARGET);

  // Check git is available
  try {
    await execFileAsync('git', ['--version']);
  } catch {
    logger.error('Git is required but was not found on your PATH. Please install git and try again.');
    process.exitCode = 1;
    return;
  }

  // Check if already installed
  if (await fs.pathExists(targetDir) && !options.force) {
    const metadata = await readMetadata(targetDir).catch(
      (e) => {
        logger.warn(`Failed to read existing skills metadata: ${(e as Error).message}`);
        return null;
      },
    );
    if (!metadata) {
      logger.info('Skills already installed. Use --force to reinstall.');
      return;
    }

    // If the existing ref is not a semver tag (e.g. master) we require force
    // flag to update, otherwise we allow updating if the new ref is a semver
    // tag that is newer than the existing one
    if (!isSemverTag(metadata.ref) || (isSemverTag(ref) && compareSemver(metadata.ref, ref) >= 0)) {
      logger.info(`Skills already installed (ref ${metadata.ref}). Use --force to reinstall.`);
      return;
    }
    logger.info(`Upgrading skills from version ${metadata.ref} to ${ref}`);
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'markbind-skills-'));

  try {
    logger.info(`Downloading skills (${ref})...`);

    await execFileAsync(
      'git',
      ['clone', '--depth', '1', '--branch', ref, SKILLS_REPO, tempDir],
      { timeout: CLONE_TIMEOUT_MS },
    );

    // Skills may be at repo root or in a skills/ subdirectory
    const skillsSubdir = path.join(tempDir, 'skills');
    const searchDir = await fs.pathExists(skillsSubdir) ? skillsSubdir : tempDir;

    const skillNames = await findSkillDirs(searchDir);

    if (skillNames.length === 0) {
      logger.error('No skills found in the downloaded repository.');
      process.exitCode = 1;
      return;
    }

    // Clear existing skills
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.ensureDir(targetDir);

    const copyPromises = skillNames.map((name) => {
      logger.info(`Installing skill: ${name}...`);
      return fs.copy(path.join(searchDir, name), path.join(targetDir, name));
    });

    await Promise.all(copyPromises);

    await writeMetadata(targetDir, ref, skillNames);

    logger.info(`Installed ${skillNames.length} skill(s) to ${SKILLS_TARGET}/`);

    if (options.agents) {
      await Promise.all(options.agents.map(async (agent) => {
        const agentSkillsDir = path.join(process.cwd(), agent, 'skills');
        if (await fs.pathExists(agentSkillsDir)) {
          logger.warn('Agent skills directory already exist. Skipping symlink creation.');
          logger.warn(`Please manually symlink ${targetDir} to ${agentSkillsDir}`
            + ` if you want to use the skills with ${options.agents}.`);
        } else {
          await fs.ensureSymlink(targetDir, agentSkillsDir, 'dir');
          logger.info(`Symlinked skills to ${agent}/skills/`);
        }
      }));
    }
  } catch (error) {
    if (_.isError(error)) {
      const msg = error.message;
      if ((msg.includes('Remote branch') && msg.includes('not found'))
        || msg.includes('not found in upstream')
        || msg.includes('does not exist')) {
        logger.error(`Skills ref '${ref}' was not found in the repository.`);
        logger.error('Use --ref to specify a branch or tag (e.g., --ref main).');
      } else if (msg.includes('timed out') || msg.includes('block timeout')) {
        logger.error('Download timed out. Check your network connection and try again.');
      } else {
        logger.error(`Failed to install skills: ${msg}`);
      }
    } else {
      logger.error(`Failed to install skills: ${error}`);
    }
    process.exitCode = 1;
  } finally {
    await fs.remove(tempDir).catch(() => { });
  }
}

export {
  install, findSkillDirs, writeMetadata, readMetadata, isSemverTag, compareSemver,
};
