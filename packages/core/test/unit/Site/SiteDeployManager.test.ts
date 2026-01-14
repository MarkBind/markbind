import fs from 'fs-extra';
import { SiteDeployManager, DeployOptions } from '../../../src/Site/SiteDeployManager';
import { SiteConfig } from '../../../src/Site/SiteConfig';
import { SITE_JSON_DEFAULT } from '../utils/data';

const mockFs = fs as any;

jest.mock('fs');
jest.mock('gh-pages');
jest.mock('simple-git', () => jest.fn(() => ({})));
jest.mock('../../../src/utils/git', () => ({
  getRemoteBranchFile: jest.fn(() => Promise.resolve(null)),
  getRemoteUrl: jest.fn(() => Promise.resolve('https://github.com/mock-user/mock-repo.git')),
}));

const rootPath = '/tmp/test';
const outputPath = '/tmp/test/_site';

const mockGhPages = {
  dir: '',
  options: {},
} as {
  dir: string;
  options: any;
};

// Mock gh-pages publish
const ghpages = require('gh-pages');

ghpages.publish = jest.fn((dir: string, options: DeployOptions, callback: (err?: any) => void) => {
  mockGhPages.dir = dir;
  mockGhPages.options = options;
  callback();
});
ghpages.clean = jest.fn();

afterEach(() => {
  mockFs.vol.reset();
  mockGhPages.dir = '';
  mockGhPages.options = {};
  jest.clearAllMocks();
});

test('SiteDeployManager deploys with default settings', async () => {
  const json = {
    _site: {},
  };
  mockFs.vol.fromJSON(json, rootPath);

  const deployManager = new SiteDeployManager(rootPath, outputPath);
  deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

  await deployManager.deploy(false);
  expect(mockGhPages.dir).toEqual(outputPath);
  expect(mockGhPages.options)
    .toEqual({
      branch: 'gh-pages',
      message: 'Site Update. [skip ci]',
      repo: '',
      remote: 'origin',
    });
});

test('SiteDeployManager deploys with custom settings', async () => {
  const customConfig = JSON.parse(SITE_JSON_DEFAULT);
  customConfig.deploy = {
    message: 'Custom Site Update.',
    repo: 'https://github.com/USER/REPO.git',
    branch: 'master',
  };
  const json = {
    _site: {},
  };
  mockFs.vol.fromJSON(json, rootPath);

  const deployManager = new SiteDeployManager(rootPath, outputPath);
  deployManager.siteConfig = customConfig as SiteConfig;

  await deployManager.deploy(false);
  expect(mockGhPages.dir).toEqual(outputPath);
  expect(mockGhPages.options)
    .toEqual({
      branch: 'master',
      message: 'Custom Site Update. [skip ci]',
      repo: 'https://github.com/USER/REPO.git',
      remote: 'origin',
    });
});

test('SiteDeployManager should not deploy without a built site', async () => {
  const json = {};
  mockFs.vol.fromJSON(json, rootPath);

  const deployManager = new SiteDeployManager(rootPath, outputPath);
  deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

  await expect(deployManager.deploy(false))
    .rejects
    .toThrow(
      new Error('The site directory does not exist. '
        + 'Please build the site first before deploy.'));
});

describe('Site deploy with various CI environments', () => {
  // Keep a copy of the original environment
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    // Delete all environment variables that affect tests
    delete process.env.GITHUB_TOKEN;
    delete process.env.TRAVIS;
    delete process.env.TRAVIS_REPO_SLUG;
    delete process.env.APPVEYOR;
    delete process.env.APPVEYOR_REPO_NAME;
    delete process.env.GITHUB_ACTIONS;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.CIRCLECI;
    delete process.env.CIRCLE_PROJECT_USERNAME;
    delete process.env.CIRCLE_PROJECT_REPONAME;
  });

  afterAll(() => {
    // Restore the original environment
    process.env = { ...OLD_ENV };
  });

  /* eslint-disable max-len */
  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }, { name: 'Deployment Bot', email: 'deploy@travis-ci.org' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }, { name: 'AppVeyorBot', email: 'deploy@appveyor.com' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }, { name: 'github-actions', email: 'github-actions@github.com' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }, { name: 'circleci-bot', email: 'deploy@circleci.com' }],
  ])('Site deploy -c/--ci deploys with default settings',
  /* eslint-enable max-len */
     async (ciIdentifier, repoSlugIdentifier, deployBotUser) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       const genericRepoSlug = 'GENERIC_USER/GENERIC_REPO';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = genericRepoSlug;
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO';
       }

       const json = {
         _site: {},
       };
       mockFs.vol.fromJSON(json, rootPath);

       const deployManager = new SiteDeployManager(rootPath, outputPath);
       deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

       await deployManager.deploy(true);
       expect(mockGhPages.options.repo)
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${genericRepoSlug}.git`);
       expect(mockGhPages.options.user).toEqual(deployBotUser);
     });

  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }],
  ])('Site deploy -c/--ci deploys with custom GitHub repo',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = 'GENERIC_USER/GENERIC_REPO';
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO';
       }

       const customRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
       customRepoConfig.deploy.repo = 'https://github.com/USER/REPO.git';
       const json = {
         _site: {},
       };
       mockFs.vol.fromJSON(json, rootPath);

       const deployManager = new SiteDeployManager(rootPath, outputPath);
       deployManager.siteConfig = customRepoConfig as SiteConfig;

       await deployManager.deploy(true);
       expect(mockGhPages.options.repo)
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/USER/REPO.git`);
     });

  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }],
  ])('Site deploy -c/--ci deploys to correct repo when .git is in repo name',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       const genericRepoSlug = 'GENERIC_USER/GENERIC_REPO.github.io';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = genericRepoSlug;
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO.github.io';
       }

       const json = {
         _site: {},
       };
       mockFs.vol.fromJSON(json, rootPath);

       const deployManager = new SiteDeployManager(rootPath, outputPath);
       deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

       await deployManager.deploy(true);
       expect(mockGhPages.options.repo)
         // eslint-disable-next-line max-len
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${genericRepoSlug}.git`);
     });

  test('Site deploy -c/--ci should not deploy if not in CI environment', async () => {
    process.env.GITHUB_TOKEN = 'githubToken';

    const json = {
      _site: {},
    };
    mockFs.vol.fromJSON(json, rootPath);

    const deployManager = new SiteDeployManager(rootPath, outputPath);
    deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

    await expect(deployManager.deploy(true))
      .rejects
      .toThrow(new Error('-c/--ci should only be run in CI environments.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
    ['GITHUB_ACTIONS'],
    ['CIRCLECI'],
  ])('Site deploy -c/--ci should not deploy without authentication token', async (ciIdentifier) => {
    process.env[ciIdentifier] = 'true';

    const json = {
      _site: {},
    };
    mockFs.vol.fromJSON(json, rootPath);

    const deployManager = new SiteDeployManager(rootPath, outputPath);
    deployManager.siteConfig = JSON.parse(SITE_JSON_DEFAULT) as SiteConfig;

    await expect(deployManager.deploy(true))
      .rejects
      .toThrow(new Error('The environment variable GITHUB_TOKEN does not exist.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
    ['GITHUB_ACTIONS'],
    ['CIRCLECI'],
  ])('Site deploy -c/--ci should not deploy if custom repository is not on GitHub', async (ciIdentifier) => {
    process.env[ciIdentifier] = 'true';
    process.env.GITHUB_TOKEN = 'githubToken';

    const invalidRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
    invalidRepoConfig.deploy.repo = 'INVALID_GITHUB_REPO';
    const json = {
      _site: {},
    };
    mockFs.vol.fromJSON(json, rootPath);

    const deployManager = new SiteDeployManager(rootPath, outputPath);
    deployManager.siteConfig = invalidRepoConfig as SiteConfig;

    await expect(deployManager.deploy(true))
      .rejects
      .toThrow(new Error('-c/--ci expects a GitHub repository.\n'
        + `The specified repository ${invalidRepoConfig.deploy.repo} is not valid.`));
  });
});
