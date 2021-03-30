#!/usr/bin/env node

// Entry file for Markbind project
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const Promise = require('bluebird');

const _ = {};
_.isBoolean = require('lodash/isBoolean');

const { Site } = require('@markbind/core');
const { pageVueServerRenderer } = require('@markbind/core/src/Page/PageVueServerRenderer');

const fsUtil = require('@markbind/core/src/utils/fsUtil');
const utils = require('@markbind/core/src/utils');
const {
  INDEX_MARKDOWN_FILE,
  INDEX_MARKBIND_FILE,
  LAZY_LOADING_SITE_FILE_NAME,
  SITE_CONFIG_NAME,
} = require('@markbind/core/src/Site/constants');

const liveServer = require('./src/lib/live-server');
const cliUtil = require('./src/util/cliUtil');
const logger = require('./src/util/logger');

const {
  ACCEPTED_COMMANDS,
  ACCEPTED_COMMANDS_ALIAS,
} = require('./src/constants');
const CLI_VERSION = require('./package.json').version;

process.title = 'MarkBind';
process.stdout.write(
  `${String.fromCharCode(27)}]0; MarkBind${String.fromCharCode(7)}`,
);

function printHeader() {
  logger.logo();
  logger.log(` v${CLI_VERSION}`);
}

function handleError(error) {
  logger.error(error.message);
  process.exitCode = 1;
}

// We want to customize the help message to print MarkBind's header,
// but commander.js does not provide an API directly for doing so.
// Hence we override commander's outputHelp() completely.
program.defaultOutputHelp = program.outputHelp;
program.outputHelp = function (cb) {
  printHeader();
  this.defaultOutputHelp(cb);
};

program
  .allowUnknownOption()
  .usage('<command>');

program
  .name('markbind')
  .version(CLI_VERSION);

program
  .command('init [root]')
  .option('-c, --convert', 'convert a GitHub wiki or docs folder to a MarkBind website')
  .option('-t, --template <type>', 'initialise markbind with a specified template', 'default')
  .alias('i')
  .description('init a markbind website project')
  .action((root, options) => {
    const rootFolder = path.resolve(root || process.cwd());
    const outputRoot = path.join(rootFolder, '_site');
    printHeader();
    if (options.convert) {
      if (fs.existsSync(path.resolve(rootFolder, 'site.json'))) {
        logger.error('Cannot convert an existing MarkBind website!');
        return;
      }
    }
    Site.initSite(rootFolder, options.template)
      .then(() => {
        logger.info('Initialization success.');
      })
      .then(() => {
        if (options.convert) {
          logger.info('Converting to MarkBind website.');
          new Site(rootFolder, outputRoot).convert()
            .then(() => {
              logger.info('Conversion success.');
            })
            .catch(handleError);
        }
      })
      .catch(handleError);
  });

program
  .command('serve [root]')
  .alias('s')
  .description('build then serve a website from a directory')
  .option('-f, --force-reload', 'force a full reload of all site files when a file is changed')
  .option('-n, --no-open', 'do not automatically open the site in browser')
  .option('-o, --one-page [file]', 'build and serve only a single page in the site initially,'
    + 'building more pages when they are navigated to. Also lazily rebuilds only the page being viewed when'
    + 'there are changes to the source files (if needed), building others when navigated to')
  .option('-b, --background-build', 'when --one-page is specified, enhances one-page serve by building'
    + 'remaining pages in the background')
  .option('-p, --port <port>', 'port for server to listen on (Default is 8080)')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .option('-d, --dev', 'development mode, enabling live & hot reload for frontend source files.')
  .action((userSpecifiedRoot, options) => {
    if (options.dev) {
      logger.useDebugConsole();
    }

    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);

      if (options.forceReload && options.onePage) {
        handleError(new Error('Oops! You shouldn\'t need to use the --force-reload option with --one-page.'));
        process.exit();
      }
    } catch (err) {
      handleError(err);
    }
    const logsFolder = path.join(rootFolder, '_markbind/logs');
    const outputFolder = path.join(rootFolder, '_site');

    const defaultFiles = [INDEX_MARKDOWN_FILE, INDEX_MARKBIND_FILE];
    const presentDefaultFile = defaultFiles.find(utils.fileExists);
    if (options.onePage === true && !presentDefaultFile) {
      handleError(new Error('Oops! It seems that you didn\'t have the default file index.md|mbd.'));
      process.exit();
    }
    let onePagePath = options.onePage === true ? presentDefaultFile : options.onePage;
    onePagePath = onePagePath ? utils.ensurePosix(onePagePath) : onePagePath;

    const reloadAfterBackgroundBuild = () => {
      logger.info('All opened pages will be reloaded.');
      liveServer.reloadActiveTabs();
    };

    const site = new Site(rootFolder, outputFolder, onePagePath,
                          options.forceReload, options.siteConfig, options.dev,
                          options.backgroundBuild, reloadAfterBackgroundBuild);

    const syncOpenedPages = () => {
      logger.info('Synchronizing opened pages list before reload');
      const normalizedActiveUrls = liveServer.getActiveUrls().map((url) => {
        const completeUrl = path.extname(url) === '' ? path.join(url, 'index') : url;
        return fsUtil.removeExtension(completeUrl);
      });
      site.changeCurrentOpenedPages(normalizedActiveUrls);
    };

    const addHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file add: ${filePath}`);
      if (onePagePath) {
        syncOpenedPages();
      }
      Promise.resolve('').then(async () => {
        if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
          return site.rebuildSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const changeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file change: ${filePath}`);
      if (onePagePath) {
        syncOpenedPages();
      }
      Promise.resolve('').then(async () => {
        if (path.basename(filePath) === SITE_CONFIG_NAME) {
          return site.reloadSiteConfig();
        }
        if (site.isDependencyOfPage(filePath)) {
          return site.rebuildAffectedSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const removeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file deletion: ${filePath}`);
      if (onePagePath) {
        syncOpenedPages();
      }
      Promise.resolve('').then(async () => {
        if (site.isFilepathAPage(filePath) || site.isDependencyOfPage(filePath)) {
          return site.rebuildSourceFiles(filePath);
        }
        return site.removeAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    // server config
    const serverConfig = {
      open: options.open,
      logLevel: 0,
      root: outputFolder,
      port: options.port || 8080,
      middleware: [],
      mount: [],
    };

    printHeader();

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
          const lazyReloadMiddleware = function (req, res, next) {
            const urlExtension = path.posix.extname(req.url);

            const hasEndingSlash = req.url.endsWith('/');
            const hasNoExtension = urlExtension === '';
            const isHtmlFileRequest = urlExtension === '.html' || hasEndingSlash || hasNoExtension;

            if (!isHtmlFileRequest || req.url.endsWith('._include_.html')) {
              next();
              return;
            }

            if (hasNoExtension && !hasEndingSlash) {
              // Urls of type 'host/userGuide' - check if 'userGuide' is a raw file or does not exist
              const diskFilePath = path.resolve(rootFolder, req.url);
              if (!fs.existsSync(diskFilePath) || !(fs.statSync(diskFilePath).isDirectory())) {
                // Request for a raw file
                next();
                return;
              }
            }

            const urlWithoutBaseUrl = req.url.replace(config.baseUrl, '');
            // Map 'hostname/userGuide/' and 'hostname/userGuide' to hostname/userGuide/index.
            const urlWithIndex = (hasNoExtension || hasEndingSlash)
              ? path.posix.join(urlWithoutBaseUrl, 'index')
              : urlWithoutBaseUrl;
            const urlWithoutExtension = fsUtil.removeExtension(urlWithIndex);

            const didInitiateRebuild = site.changeCurrentPage(urlWithoutExtension);
            if (didInitiateRebuild) {
              req.url = utils.ensurePosix(path.join(config.baseUrl || '/', LAZY_LOADING_SITE_FILE_NAME));
            }
            next();
          };

          const onePageHtmlUrl = `${config.baseUrl}/${onePagePath.replace(/\.(md|mbd|mbdf)$/, '.html')}`;
          serverConfig.open = serverConfig.open && onePageHtmlUrl;

          serverConfig.middleware.push(lazyReloadMiddleware);
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
          .on('add', addHandler)
          .on('change', changeHandler)
          .on('unlink', removeHandler);
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
      .catch(handleError);
  });

program
  .command('build [root] [output]')
  .alias('b')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .description('build a website')
  .action((userSpecifiedRoot, output, options) => {
    // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
    const baseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
    } catch (err) {
      handleError(err);
    }
    const defaultOutputRoot = path.join(rootFolder, '_site');
    const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
    printHeader();
    new Site(rootFolder, outputFolder, undefined, undefined, options.siteConfig)
      .generate(baseUrl)
      .then(() => {
        logger.info('Build success!');
      })
      .catch(handleError);
  });

program
  .command('deploy')
  .alias('d')
  .description('deploy the site to the repo\'s Github pages')
  .option('-c, --ci [githubTokenName]', 'deploy the site in CI Environment [GITHUB_TOKEN]')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .action((options) => {
    const rootFolder = path.resolve(process.cwd());
    const outputRoot = path.join(rootFolder, '_site');
    new Site(rootFolder, outputRoot, undefined, undefined, options.siteConfig).deploy(options.ci)
      .then(depUrl => (depUrl !== null ? logger.info(`Deployed at ${depUrl}!`) : logger.info('Deployed!')))
      .catch(handleError);
    printHeader();
  });

program.parse(process.argv);

if (!program.args.length
  || !(ACCEPTED_COMMANDS.concat(ACCEPTED_COMMANDS_ALIAS)).includes(process.argv[2])) {
  if (program.args.length) {
    logger.warn(`Command '${program.args[0]}' doesn't exist, run "markbind --help" to list commands.`);
  } else {
    program.help();
  }
}
