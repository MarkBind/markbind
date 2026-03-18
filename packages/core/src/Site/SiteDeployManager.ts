import fs from 'fs-extra';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import ghpages, { PublishOptions } from 'gh-pages';
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

export type DeployResult = {
  ghPagesUrl: string | null,
  ghActionsUrl: string | null,
};

type ParsedGitHubRepo = {
  owner: string,
  repoName: string,
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
   * Helper function for deploy(). Returns the deployment URLs (GitHub Pages and GitHub Actions).
   */
  async generateDepUrl(ciTokenVar: boolean | string, defaultDeployConfig: DeployOptions) {
    if (!this.siteConfig) {
      throw new Error('Site config not initialized');
    }

    const depOptions = await this.getDepOptions(ciTokenVar, defaultDeployConfig, ghpages.publish);
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
                      publish: (basePath: string, options: PublishOptions) => Promise<void>) {
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

    const parsed = SiteDeployManager.parseGitHubRemoteUrl(repo);
    if (!parsed) {
      throw new Error('-c/--ci expects a GitHub repository.\n'
        + `The specified repository ${repo} is not valid.`);
    }

    return `${parsed.owner}/${parsed.repoName}`;
  }

  /**
   * Helper function for deploy().
   */
  static getDepUrl(options: DeployOptions) {
    const git = simpleGit({ baseDir: process.cwd() });
    return SiteDeployManager.getDeploymentUrl(git, options);
  }

  /**
   * Parses a GitHub remote URL (HTTPS or SSH) and extracts the owner name and repo name.
   * Returns null if the URL format is not recognized.
   */
  static parseGitHubRemoteUrl(remoteUrl: string): ParsedGitHubRepo | null {
    const HTTPS_PREAMBLE = 'https://github.com';
    const SSH_PREAMBLE = 'git@github.com:';

    if (!remoteUrl) {
      return null;
    }
    const parts = remoteUrl.split('/');

    // get repo name
    const repoNameWithExt = parts[parts.length - 1];
    const dotIndex = repoNameWithExt.lastIndexOf('.');
    const repoName = dotIndex === -1 ? repoNameWithExt : repoNameWithExt.substring(0, dotIndex);

    if (remoteUrl.startsWith(HTTPS_PREAMBLE)) {
      // https://github.com/<name|org>/<repo>.git (HTTPS)
      const owner = parts[parts.length - 2];
      return { owner, repoName };
    } else if (remoteUrl.startsWith(SSH_PREAMBLE)) {
      // git@github.com:<name|org>/<repo>.git (SSH)
      const owner = parts[0].substring(SSH_PREAMBLE.length);
      return { owner, repoName };
    }
    return null;
  }

  /**
   * Constructs the GitHub Pages URL from a parsed remote URL.
   * Returns a URL in the format: https://<name>.github.io/<repo>
   */
  static constructGhPagesUrl(repo: ParsedGitHubRepo): string {
    return `https://${repo.owner}.github.io/${repo.repoName}`;
  }

  /**
   * Constructs the GitHub Actions URL from a remote URL.
   * Returns a URL in the format: https://github.com/<name>/<repo>/actions
   */
  static constructGhActionsUrl(repo: ParsedGitHubRepo): string {
    return `https://github.com/${repo.owner}/${repo.repoName}/actions`;
  }

  /**
   * Gets the deployed website's url and GitHub Actions url,
   * returning null for either if there was an error retrieving it.
   */
  static async getDeploymentUrl(git: SimpleGit, options: DeployOptions): Promise<DeployResult> {
    const { remote, branch, repo } = options;
    const cnamePromise = gitUtil.getRemoteBranchFile(git, 'blob', remote, branch, 'CNAME');
    const remoteUrlPromise = gitUtil.getRemoteUrl(git, remote);
    const promises = [cnamePromise, remoteUrlPromise];

    try {
      const promiseResults: string[] = await Promise.all(promises) as string[];
      const cname = promiseResults[0];
      const remoteUrl = promiseResults[1];

      const effectiveRemoteUrl = repo || (remoteUrl ? remoteUrl.trim() : '');

      const parsedRepo = SiteDeployManager.parseGitHubRemoteUrl(effectiveRemoteUrl);
      let ghPagesUrl: string | null;
      if (cname) {
        ghPagesUrl = cname.trim();
      } else {
        ghPagesUrl = parsedRepo ? SiteDeployManager.constructGhPagesUrl(parsedRepo) : null;
      }

      const ghActionsUrl = parsedRepo ? SiteDeployManager.constructGhActionsUrl(parsedRepo) : null;

      return { ghPagesUrl, ghActionsUrl };
    } catch (err) {
      logger.error(err);
      return { ghPagesUrl: null, ghActionsUrl: null };
    }
  }
}
