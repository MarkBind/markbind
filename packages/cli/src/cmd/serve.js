const chokidar = require('chokidar');
const path = require('path');

const { Site } = require('@markbind/core').Site;
const { pageVueServerRenderer } = require('@markbind/core/src/Page/PageVueServerRenderer');

const fsUtil = require('@markbind/core/src/utils/fsUtil');
const { INDEX_MARKDOWN_FILE } = require('@markbind/core/src/Site/constants');

const cliUtil = require('../util/cliUtil');
const liveServer = require('../lib/live-server');
const logger = require('../util/logger');
const {
  addHandler,
  changeHandler,
  lazyReloadMiddleware,
  removeHandler,
} = require('../util/serveUtil');

function serve(userSpecifiedRoot, options) {
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
    logger.error(error.message);
    process.exitCode = 1;
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
  const serverConfig = {
    open: options.open,
    logLevel: 0,
    root: outputFolder,
    port: options.port || 8080,
    middleware: [],
    mount: [],
  };

  site
    .readSiteConfig()
    .then(async (config) => {
      serverConfig.mount.push([config.baseUrl || '/', outputFolder]);

      if (options.dev) {
        // eslint-disable-next-line global-require
        const webpackDevConfig = require('@markbind/core-web/webpack.dev');
        await webpackDevConfig.serverEntry(pageVueServerRenderer.updateMarkBindVueBundle, rootFolder);

        const getMiddlewares = webpackDevConfig.clientEntry;
        getMiddlewares(`${config.baseUrl}/markbind`)
          .forEach(middleware => serverConfig.middleware.push(middleware));
      }

      if (onePagePath) {
        const onePageHtmlUrl = `${config.baseUrl}/${onePagePath.replace(/\.md$/, '.html')}`;
        serverConfig.open = serverConfig.open && onePageHtmlUrl;
        serverConfig.middleware.push(lazyReloadMiddleware(site, rootFolder, config));
      } else {
        serverConfig.open = serverConfig.open && `${config.baseUrl}/`;
      }

      return site.generate();
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
        const serveHost = address.address === '0.0.0.0' ? '127.0.0.1' : address.address;
        const serveURL = `http://${serveHost}:${address.port}`;
        logger.info(`Serving "${outputFolder}" at ${serveURL}`);
        logger.info('Press CTRL+C to stop ...');
      });
    })
    .catch((error) => {
      logger.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = {
  serve,
};
