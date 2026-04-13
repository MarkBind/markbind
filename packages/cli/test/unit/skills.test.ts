import path from 'path';
import os from 'os';
import { vol, fs as memfs } from 'memfs';

import { execFile } from 'child_process';
import _ from 'lodash';
import * as logger from '../../src/util/logger.js';
import {
  install,
  findSkillDirs,
  writeMetadata,
  readMetadata,
  isSemverTag,
  compareSemver,
} from '../../src/cmd/skills.js';

jest.mock('fs-extra', () => {
  const pathModule = jest.requireActual('path');
  const { fs } = jest.requireActual('memfs');

  const copyRecursive = async (src: string, dest: string) => {
    const stats = await fs.promises.lstat(src);
    if (stats.isDirectory()) {
      await fs.promises.mkdir(dest, { recursive: true });
      const entries = await fs.promises.readdir(src);
      await Promise.all(entries.map((entry: string) => copyRecursive(
        pathModule.join(src, entry),
        pathModule.join(dest, entry),
      )));
      return;
    }

    await fs.promises.mkdir(pathModule.dirname(dest), { recursive: true });
    await fs.promises.copyFile(src, dest);
  };

  return {
    __esModule: true,
    default: {
      readdir: (dir: string, options?: unknown) => fs.promises.readdir(dir, options as never),
      pathExists: async (filePath: string) => fs.existsSync(filePath),
      writeJson: async (filePath: string, data: unknown, options?: { spaces?: number }) => {
        await fs.promises.mkdir(pathModule.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, options?.spaces ?? 0));
      },
      readJson: async (filePath: string) => JSON.parse(await fs.promises.readFile(filePath, 'utf8')),
      mkdtemp: (prefix: string) => fs.promises.mkdtemp(prefix),
      rm: (filePath: string, options?: unknown) => fs.promises.rm(filePath, options as never),
      ensureDir: (dir: string) => fs.promises.mkdir(dir, { recursive: true }),
      copy: copyRecursive,
      remove: (filePath: string) => fs.promises.rm(filePath, { recursive: true, force: true }),
      ensureSymlink: async (target: string, filePath: string, type: unknown) => {
        await fs.promises.mkdir(pathModule.dirname(filePath), { recursive: true });
        await fs.promises.symlink(target, filePath, type as never);
      },
    },
  };
});

jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

jest.mock('../../src/util/logger.js', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

type ExecCallback = (error: Error | null, stdout?: string, stderr?: string) => void;

const mockExecFile = execFile as unknown as jest.Mock;

const mockedLogger = logger as jest.Mocked<typeof logger>;

const WORKDIR = '/workspace/project';
const TMPDIR = '/tmp';

const flushPromises = () => new Promise(process.nextTick);

function setExecFileMock(
  impl: (file: string, args: string[], cb: ExecCallback, options?: { timeout?: number }) => void,
) {
  mockExecFile.mockImplementation(
    (file: string, args: string[], optionsOrCb: unknown, cbMaybe?: ExecCallback) => {
      const cb = _.isFunction(optionsOrCb)
        ? optionsOrCb as ExecCallback
        : cbMaybe as ExecCallback;
      const options = _.isFunction(optionsOrCb) ? undefined : optionsOrCb as { timeout?: number };
      impl(file, args, cb, options);
    });
}

function seedClonedSkills(tempDir: string, skillNames: string[], underSkillsSubdir = false) {
  const root = underSkillsSubdir ? path.join(tempDir, 'skills') : tempDir;
  const files = Object.fromEntries(skillNames.map(name => [path.join(root, name, 'SKILL.md'), `# ${name}`]));
  vol.fromJSON(files, '/');
}

function listTmpSkillCloneDirs(): string[] {
  if (!memfs.existsSync(TMPDIR)) {
    return [];
  }
  const tmpEntries = memfs.readdirSync(TMPDIR, 'utf8') as string[];
  return tmpEntries.filter(name => name.startsWith('markbind-skills-'));
}

beforeEach(() => {
  vol.reset();
  vol.fromJSON({
    [path.join(TMPDIR, '.keep')]: '',
    [path.join(WORKDIR, '.keep')]: '',
  }, '/');
  jest.resetAllMocks();
  jest.spyOn(os, 'tmpdir').mockReturnValue(TMPDIR);
  jest.spyOn(process, 'cwd').mockReturnValue(WORKDIR);
  process.exitCode = undefined;
});

afterEach(() => {
  vol.reset();
  jest.restoreAllMocks();
  process.exitCode = undefined;
});

describe('isSemverTag', () => {
  test.each([
    ['v1.0.0', true],
    ['v12.34.56', true],
    ['1.0.0', false],
    ['v1.0', false],
    ['main', false],
    ['v1.0.0-beta', false],
    ['', false],
  ])('returns %p for %p', (tag, expected) => {
    expect(isSemverTag(tag)).toBe(expected);
  });
});

describe('compareSemver', () => {
  test('returns 0 for equal versions', () => {
    expect(compareSemver('v1.2.3', 'v1.2.3')).toBe(0);
  });

  test('compares major versions correctly', () => {
    expect(compareSemver('v2.0.0', 'v1.9.9')).toBe(1);
    expect(compareSemver('v1.0.0', 'v2.0.0')).toBe(-1);
  });

  test('compares minor versions correctly', () => {
    expect(compareSemver('v1.4.0', 'v1.3.9')).toBe(1);
    expect(compareSemver('v1.2.0', 'v1.3.0')).toBe(-1);
  });

  test('compares patch versions correctly', () => {
    expect(compareSemver('v1.2.4', 'v1.2.3')).toBe(1);
    expect(compareSemver('v1.2.3', 'v1.2.4')).toBe(-1);
  });

  test('handles missing and mixed v prefixes', () => {
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
    expect(compareSemver('v1.2.3', '1.2.3')).toBe(0);
  });

  test('compares multi-digit parts numerically', () => {
    expect(compareSemver('v1.10.0', 'v1.9.0')).toBe(1);
  });
});

describe('findSkillDirs', () => {
  test('finds only directories containing SKILL.md', async () => {
    vol.fromJSON({
      '/skills/alpha/SKILL.md': '# alpha',
      '/skills/beta/README.md': '# beta',
      '/skills/gamma/SKILL.md': '# gamma',
      '/skills/not-a-dir.md': 'file',
    }, '/');

    await expect(findSkillDirs('/skills')).resolves.toEqual(['alpha', 'gamma']);
  });

  test('returns empty array when directory has no skill folders', async () => {
    vol.fromJSON({
      '/skills/README.md': 'root file',
    }, '/');

    await expect(findSkillDirs('/skills')).resolves.toEqual([]);
  });
});

describe('writeMetadata and readMetadata', () => {
  test('round-trips metadata', async () => {
    const target = '/skills-target';

    await writeMetadata(target, 'v1.2.3', ['one', 'two']);
    const metadata = await readMetadata(target);

    expect(metadata).toEqual({
      ref: 'v1.2.3',
      skills: ['one', 'two'],
      installedAt: expect.any(String),
    });
    expect(new Date(metadata!.installedAt).toISOString()).toBe(metadata!.installedAt);
  });

  test('throws when metadata file is missing', async () => {
    await expect(readMetadata('/missing')).rejects.toThrow('Metadata file not found');
  });

  test('throws when metadata file is corrupted', async () => {
    vol.fromJSON({
      '/skills/.markbind-skills.json': '{not-json',
    }, '/');

    await expect(readMetadata('/skills')).rejects.toThrow('Failed to read metadata file:');
  });
});

describe('install', () => {
  test('installs with default ref from packageJson aiSkillsVersion', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, 'git version 2.43.0', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['skill-a', 'skill-b']);
      cb(null, '', '');
    });

    await install({});

    const cloneCall = mockExecFile.mock.calls.find(([, args]) => args[0] === 'clone');
    expect(cloneCall).toBeDefined();
    expect(cloneCall![1]).toEqual(expect.arrayContaining(['--branch', 'v0.1.0']));
    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/skill-a/SKILL.md'))).toBe(true);
    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/skill-b/SKILL.md'))).toBe(true);
    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/.markbind-skills.json'))).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });

  test('installs with custom ref', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['skill-a']);
      cb(null, '', '');
    });

    await install({ ref: 'main' });

    const cloneCall = mockExecFile.mock.calls.find(([, args]) => args[0] === 'clone');
    expect(cloneCall![1]).toEqual(expect.arrayContaining(['--branch', 'main']));
  });

  test('sets exitCode when git is not found', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(new Error('not found'));
      }
    });

    await install({});

    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Git is required but was not found on your PATH. Please install git and try again.',
    );
    expect(process.exitCode).toBe(1);
  });

  test('skips install when same version is already installed', async () => {
    vol.fromJSON({
      [path.join(WORKDIR, '.agents/skills/.markbind-skills.json')]: JSON.stringify({
        ref: 'v0.1.0',
        skills: ['existing'],
        installedAt: new Date().toISOString(),
      }),
    }, '/');

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
      }
    });

    await install({});

    expect(mockedLogger.info).toHaveBeenCalledWith(
      'Skills already installed (ref v0.1.0). Use --force to reinstall.',
    );
    expect(mockExecFile.mock.calls.some(([, args]) => args[0] === 'clone')).toBe(false);
  });

  test('reinstalls with --force', async () => {
    vol.fromJSON({
      [path.join(WORKDIR, '.agents/skills/.markbind-skills.json')]: JSON.stringify({
        ref: 'v0.1.0',
        skills: ['old-skill'],
        installedAt: new Date().toISOString(),
      }),
      [path.join(WORKDIR, '.agents/skills/old-skill/SKILL.md')]: '# old',
    }, '/');

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['new-skill']);
      cb(null, '', '');
    });

    await install({ force: true });

    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/new-skill/SKILL.md'))).toBe(true);
    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/old-skill/SKILL.md'))).toBe(false);
  });

  test('upgrades when new semver ref is newer', async () => {
    vol.fromJSON({
      [path.join(WORKDIR, '.agents/skills/.markbind-skills.json')]: JSON.stringify({
        ref: 'v0.0.9',
        skills: ['existing'],
        installedAt: new Date().toISOString(),
      }),
    }, '/');

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['upgraded']);
      cb(null, '', '');
    });

    await install({});

    expect(mockedLogger.info).toHaveBeenCalledWith('Upgrading skills from version v0.0.9 to v0.1.0');
    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/upgraded/SKILL.md'))).toBe(true);
  });

  test('skips when existing ref is non-semver without force', async () => {
    vol.fromJSON({
      [path.join(WORKDIR, '.agents/skills/.markbind-skills.json')]: JSON.stringify({
        ref: 'main',
        skills: ['existing'],
        installedAt: new Date().toISOString(),
      }),
    }, '/');

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
      }
    });

    await install({});

    expect(mockedLogger.info).toHaveBeenCalledWith(
      'Skills already installed (ref main). Use --force to reinstall.',
    );
    expect(mockExecFile.mock.calls.some(([, args]) => args[0] === 'clone')).toBe(false);
  });

  test('sets exitCode when no skills are found', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      vol.fromJSON({ [path.join(args[args.length - 1], 'README.md')]: '# repo' }, '/');
      cb(null, '', '');
    });

    await install({});

    expect(mockedLogger.error).toHaveBeenCalledWith('No skills found in the downloaded repository.');
    expect(process.exitCode).toBe(1);
  });

  test('finds skills in skills/ subdirectory', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['nested-skill'], true);
      cb(null, '', '');
    });

    await install({});

    expect(memfs.existsSync(path.join(WORKDIR, '.agents/skills/nested-skill/SKILL.md'))).toBe(true);
  });

  test('handles ref-not-found errors', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      cb(new Error('Remote branch no-such-branch not found in upstream origin'));
    });

    await install({ ref: 'no-such-branch' });

    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Skills ref 'no-such-branch' was not found in the repository.",
    );
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Use --ref to specify a branch or tag (e.g., --ref main).',
    );
    expect(process.exitCode).toBe(1);
  });

  test('handles timeout errors', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      cb(new Error('command timed out after 30000 milliseconds'));
    });

    await install({});

    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Download timed out. Check your network connection and try again.',
    );
    expect(process.exitCode).toBe(1);
  });

  test('handles generic errors', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      cb(new Error('boom'));
    });

    await install({});

    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to install skills: boom');
    expect(process.exitCode).toBe(1);
  });

  test('cleans up temporary clone directory on success and failure', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['cleanup']);
      cb(null, '', '');
    });

    await install({});
    expect(listTmpSkillCloneDirs()).toEqual([]);

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      cb(new Error('boom'));
    });

    await install({ force: true });
    expect(listTmpSkillCloneDirs()).toEqual([]);
  });

  test('creates symlinks for specified agents', async () => {
    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['skill-a']);
      cb(null, '', '');
    });

    await install({ agents: ['.claude', '.cursor'] });
    await flushPromises();

    const claudeLink = path.join(WORKDIR, '.claude/skills');
    const cursorLink = path.join(WORKDIR, '.cursor/skills');
    expect(memfs.lstatSync(claudeLink).isSymbolicLink()).toBe(true);
    expect(memfs.lstatSync(cursorLink).isSymbolicLink()).toBe(true);
    expect(memfs.readlinkSync(claudeLink).toString()).toBe(path.join(WORKDIR, '.agents/skills'));
  });

  test('warns when agent skills directory already exists', async () => {
    vol.fromJSON({
      [path.join(WORKDIR, '.claude/skills/existing.txt')]: 'x',
    }, '/');

    setExecFileMock((file, args, cb) => {
      if (args[0] === '--version') {
        cb(null, '', '');
        return;
      }
      seedClonedSkills(args[args.length - 1], ['skill-a']);
      cb(null, '', '');
    });

    await install({ agents: ['.claude'] });
    await flushPromises();

    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'Agent skills directory already exist. Skipping symlink creation.',
    );
  });
});
