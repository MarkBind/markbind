import fs from 'fs-extra';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { promisify } from 'util';
import ghpages from 'gh-pages';
import * as gitUtil from '../utils/git';
import * as logger from '../utils/logger';
import { _ } from './constants';
import { SiteConfig } from './SiteConfig';

export type DeployOptions = {
  branch: string,
  message: string,
  repo: string,
  remote: string,
  user?: { name: string; email: string; },
};

/**
 * Handles the deployment of the generated site to GitHub Pages or other configured remote repositories.
 */
export class SiteDeployManager {
  rootPath: string;
  outputPath: string;
  siteConfig!: SiteConfig;

  constructor(rootPath: string, outputPath: string) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
  }

  deploy(ciTokenVar: string | boolean) {
    const defaultDeployConfig: DeployOptions = {
      branch: 'gh-pages',
      message: 'Site Update.',
      repo: '',
      remote: 'origin',
    };
    process.env.NODE_DEBUG = 'gh-pages';
    return this.generateDepUrl(ciTokenVar, defaultDeployConfig);
  }

  /**
   * Helper function for deploy(). Returns the ghpages link where the repo will be hosted.
   */
  async generateDepUrl(ciTokenVar: boolean | string, defaultDeployConfig: DeployOptions) {
    const publish = promisify(ghpages.publish);
    if (!this.siteConfig) {
      throw new Error('Site config not initialized');
    }

    const depOptions = await this.getDepOptions(ciTokenVar, defaultDeployConfig, publish);
    try {
      return await SiteDeployManager.getDepUrl(depOptions);
    } finally {
      ghpages.clean();
    }
  }

  /**
   * Helper function for deploy(). Set the options needed to be used by ghpages.publish.
   */
  async getDepOptions(ciTokenVar: boolean | string, defaultDeployConfig: DeployOptions,
                      publish: (basePath: string, options: DeployOptions) => Promise<unknown>) {
    const basePath = this.siteConfig.deploy.baseDir || this.outputPath;
    if (!fs.existsSync(basePath)) {
      throw new Error(
        'The site directory does not exist. Please build the site first before deploy.');
    }
    const options: DeployOptions = {
      branch: this.siteConfig.deploy.branch || defaultDeployConfig.branch,
      message: this.siteConfig.deploy.message || defaultDeployConfig.message,
      repo: this.siteConfig.deploy.repo || defaultDeployConfig.repo,
      remote: defaultDeployConfig.remote,
    };
    options.message = options.message.concat(' [skip ci]');

    // Globally set Cache Directory to /node_modules/.cache for gh-pages
    if (!process.env.CACHE_DIR || ['true', 'false', '1', '0'].includes(process.env.CACHE_DIR as string)) {
      const cacheDirectory = path.join(this.rootPath, 'node_modules', '.cache');
      fs.emptydirSync(path.join(cacheDirectory, 'gh-pages'));
      process.env.CACHE_DIR = cacheDirectory;
    }

    if (ciTokenVar) {
      const ciToken = _.isBoolean(ciTokenVar) ? 'GITHUB_TOKEN' : ciTokenVar;
      if (!process.env[ciToken]) {
        throw new Error(`The environment variable ${ciToken} does not exist.`);
      }
      const githubToken = process.env[ciToken];
      let repoSlug;

      if (process.env.TRAVIS) {
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.TRAVIS_REPO_SLUG);

        options.user = {
          name: 'Deployment Bot',
          email: 'deploy@travis-ci.org',
        };
      } else if (process.env.APPVEYOR) {
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.APPVEYOR_REPO_NAME);

        options.user = {
          name: 'AppVeyorBot',
          email: 'deploy@appveyor.com',
        };
      } else if (process.env.GITHUB_ACTIONS) {
        // Set cache folder to a location Github Actions can find.
        process.env.CACHE_DIR = path.join(process.env.GITHUB_WORKSPACE || '.cache');
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.GITHUB_REPOSITORY);

        options.user = {
          name: 'github-actions',
          email: 'github-actions@github.com',
        };
      } else if (process.env.CIRCLECI) {
        repoSlug = SiteDeployManager.extractRepoSlug(
          options.repo,
          `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`,
        );

        options.user = {
          name: 'circleci-bot',
          email: 'deploy@circleci.com',
        };
      } else {
        throw new Error('-c/--ci should only be run in CI environments.');
      }

      options.repo = `https://x-access-token:${githubToken}@github.com/${repoSlug}.git`;
    }

    // Waits for the repo to be updated.
    await publish(basePath, options);
    return options;
  }

  /**
   * Extract repo slug from user-specified repo URL so that we can include the access token
   */
  static extractRepoSlug(repo: string, ciRepoSlug: string | undefined) {
    if (!repo) {
      return ciRepoSlug;
    }
    const repoSlugRegex = /github\.com[:/]([\w-]+\/[\w-.]+)\.git$/;
    const repoSlugMatch = repoSlugRegex.exec(repo);
    if (!repoSlugMatch) {
      throw new Error('-c/--ci expects a GitHub repository.\n'
            + `The specified repository ${repo} is not valid.`);
    }
    const [, repoSlug] = repoSlugMatch;
    return repoSlug;
  }

  /**
   * Helper function for deploy().
   */
  static getDepUrl(options: DeployOptions) {
    const git = simpleGit({ baseDir: process.cwd() });
    return SiteDeployManager.getDeploymentUrl(git, options);
  }

  /**
   * Gets the deployed website's url, returning null if there was an error retrieving it.
   */
  static async getDeploymentUrl(git: SimpleGit, options: DeployOptions) {
    const HTTPS_PREAMBLE = 'https://';
    const SSH_PREAMBLE = 'git@github.com:';
    const GITHUB_IO_PART = 'github.io';

    // https://<name|org name>.github.io/<repo name>/
    function constructGhPagesUrl(remoteUrl: string) {
      if (!remoteUrl) {
        return null;
      }
      const parts = remoteUrl.split('/');
      if (remoteUrl.startsWith(HTTPS_PREAMBLE)) {
        // https://github.com/<name|org>/<repo>.git (HTTPS)
        const repoNameWithExt = parts[parts.length - 1];
        const repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
        const name = parts[parts.length - 2].toLowerCase();
        return `https://${name}.${GITHUB_IO_PART}/${repoName}`;
      } else if (remoteUrl.startsWith(SSH_PREAMBLE)) {
        // git@github.com:<name|org>/<repo>.git (SSH)
        const repoNameWithExt = parts[parts.length - 1];
        const repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
        const name = parts[0].substring(SSH_PREAMBLE.length);
        return `https://${name}.${GITHUB_IO_PART}/${repoName}`;
      }
      return null;
    }

    const { remote, branch, repo } = options;
    const cnamePromise = gitUtil.getRemoteBranchFile(git, 'blob', remote, branch, 'CNAME');
    const remoteUrlPromise = gitUtil.getRemoteUrl(git, remote);
    const promises = [cnamePromise, remoteUrlPromise];

    try {
      const promiseResults: string[] = await Promise.all(promises) as string[];
      const generateGhPagesUrl = (results: string[]) => {
        const cname = results[0];
        const remoteUrl = results[1];
        if (cname) {
          return cname.trim();
        } else if (repo) {
          return constructGhPagesUrl(repo);
        }
        return constructGhPagesUrl(remoteUrl.trim());
      };

      return generateGhPagesUrl(promiseResults);
    } catch (err) {
      logger.error(err);
      return null;
    }
  }
}
