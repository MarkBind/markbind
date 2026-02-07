import chokidar from 'chokidar';
import path from 'path';
import readline from 'readline';
import isError from 'lodash/isError';

import { Site } from '@markbind/core';
import { pageVueServerRenderer } from '@markbind/core/src/Page/PageVueServerRenderer';

import * as fsUtil from '@markbind/core/src/utils/fsUtil';
import { INDEX_MARKDOWN_FILE } from '@markbind/core/src/Site/constants';

import * as cliUtil from '../util/cliUtil';
import liveServer from '../lib/live-server';
import * as logger from '../util/logger';
import {
  addHandler,
  changeHandler,
  lazyReloadMiddleware,
  removeHandler,
} from '../util/serveUtil';

import {
  isValidServeHost,
  isIPAddressZero,
} from '../util/ipUtil';

const _ = {
  isError,
};

function questionAsync(question: string): Promise<string> {
  const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    readlineInterface.question(question, (response: string) => {
      readlineInterface.close();
      resolve(response);
    });
  });
}

function serve(userSpecifiedRoot: string, options: any) {
  if (options.dev) {
    logger.useDebugConsole();
  }

  let rootFolder;
  try {
    rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);

    if (options.forceReload && options.onePage) {
      logger.error('Oops! You shouldn\'t need to use the --force-reload option with --one-page.');
      process.exitCode = 1;
      process.exit();
    }
  } catch (error) {
    if (_.isError(error)) {
      logger.error(error.message);
      logger.error('This directory does not appear to contain a valid MarkBind site. '
          + 'Check that you are running the command in the correct directory!\n'
          + '\n'
          + 'To create a new MarkBind site, run:\n'
          + '   markbind init');
    } else {
      logger.error(`Unknown error occurred: ${error}`);
    }
    cliUtil.cleanupFailedMarkbindBuild();
    process.exitCode = 1;
    process.exit();
  }

  const logsFolder = path.join(rootFolder, '_markbind/logs');
  const outputFolder = path.join(rootFolder, '_site');

  const presentDefaultFile = fsUtil.fileExists(INDEX_MARKDOWN_FILE) ? INDEX_MARKDOWN_FILE : false;
  if (options.onePage === true && !presentDefaultFile) {
    logger.error('Oops! It seems that you didn\'t have the default file index.md.');
    process.exitCode = 1;
    process.exit();
  }
  let onePagePath = options.onePage === true ? presentDefaultFile : options.onePage;
  onePagePath = onePagePath ? fsUtil.ensurePosix(onePagePath) : onePagePath;

  const reloadAfterBackgroundBuild = () => {
    logger.info('All opened pages will be reloaded.');
    liveServer.reloadActiveTabs();
  };

  const site = new Site(rootFolder, outputFolder, onePagePath,
                        options.forceReload, options.siteConfig, options.dev,
                        options.backgroundBuild, reloadAfterBackgroundBuild);

  // server config
  const serverConfig: any = {
    open: options.open,
    logLevel: 0,
    root: outputFolder,
    port: options.port || 8080,
    host: options.address || '127.0.0.1',
    middleware: [],
    mount: [],
  };

  site
    .readSiteConfig()
    .then(async (config) => {
      if (!isValidServeHost(serverConfig.host)) {
        logger.error(`The provided IP address "${serverConfig.host}" is invalid. `
              + 'Please enter a valid IPv4 or IPv6 address and try again.');
        process.exitCode = 1;
        process.exit();
      }

      if (isIPAddressZero(serverConfig.host)) {
        const response = await questionAsync(
          'WARNING: Using the address \'0.0.0.0\' or \'::\' could potentially expose your server '
              + 'to the internet, which may pose security risks. \n'
              + 'Proceed with caution? [y/N] ');
        if (response.toLowerCase() === 'y') {
          logger.info('Proceeding to generate website');
        } else {
          logger.info('Website generation is cancelled.');
          process.exit();
        }
      }

      serverConfig.mount.push([config.baseUrl || '/', outputFolder]);

      if (options.dev) {
        // eslint-disable-next-line global-require
        const webpackDevConfig = require('@markbind/core-web/webpack.dev');
        await webpackDevConfig.serverEntry(pageVueServerRenderer.updateMarkBindVueBundle, rootFolder);

        const getMiddlewares = webpackDevConfig.clientEntry;
        getMiddlewares(`${config.baseUrl}/markbind`)
          .forEach((middleware: any) => serverConfig.middleware.push(middleware));
      }

      if (onePagePath) {
        const onePageHtmlUrl = `${config.baseUrl}/${onePagePath.replace(/\.md$/, '.html')}`;
        serverConfig.open = serverConfig.open && onePageHtmlUrl;
        serverConfig.middleware.push(lazyReloadMiddleware(site, rootFolder, config));
      } else {
        serverConfig.open = serverConfig.open && `${config.baseUrl}/`;
      }

      return site.generate('');
    })
    .then(() => {
      const watcher = chokidar.watch(rootFolder, {
        ignored: [
          logsFolder,
          outputFolder,
          /(^|[/\\])\../,
          x => x.endsWith('___jb_tmp___'), x => x.endsWith('___jb_old___'), // IDE temp files
        ],
        ignoreInitial: true,
      });
      watcher
        .on('add', addHandler(site, onePagePath))
        .on('change', changeHandler(site, onePagePath))
        .on('unlink', removeHandler(site, onePagePath));
    })
    .then(() => {
      const server = liveServer.start(serverConfig);
      server.addListener('listening', () => {
        const address = server.address();
        const isIpv6 = address.family === 'IPv6';
        const serveHost = isIpv6 ? `[${address.address}]` : address.address;
        const servePort = address.port;
        const serveURL = `http://${serveHost}:${servePort}`;
        logger.info(`Serving "${outputFolder}" at ${serveURL}`);
        logger.info('Press CTRL+C to stop ...');
      });
    })
    .catch((error) => {
      if (_.isError(error)) {
        logger.error(error.message);
      } else {
        logger.error(`Unknown error occurred: ${error}`);
      }
      process.exitCode = 1;
    });
}

export {
  serve,
};
