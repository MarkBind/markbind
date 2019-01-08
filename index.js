#!/usr/bin/env node


// Entry file for Markbind project
const chokidar = require('chokidar');
const liveServer = require('live-server');
const path = require('path');
const program = require('commander');
const Promise = require('bluebird');

const _ = {};
_.isBoolean = require('lodash/isBoolean');

const fsUtil = require('./src/util/fsUtil');
const logger = require('./src/util/logger');
const Site = require('./src/Site');

const ACCEPTED_COMMANDS = ['version', 'init', 'build', 'serve', 'deploy'];
const CLI_VERSION = require('./package.json').version;

process.title = 'MarkBind';
process.stdout.write(
  `${String.fromCharCode(27)}]0; MarkBind${String.fromCharCode(7)}`,
);

function printHeader() {
  logger.logo();
  logger.log(` v${CLI_VERSION}`);
}

program
  .allowUnknownOption()
  .usage(' <command>');

program
  .version(CLI_VERSION);

program
  .command('init [root]')
  .description('init a markbind website project')
  .action((root) => {
    const rootFolder = path.resolve(root || process.cwd());
    printHeader();
    Site.initSite(rootFolder)
      .then(() => {
        logger.info('Initialization success.');
      })
      .catch((error) => {
        logger.error(error.message);
      });
  });

program
  .command('serve [root]')
  .description('build then serve a website from a directory')
  .option('-f, --force-reload', 'force a full reload of all site files when a file is changed')
  .option('-n, --no-open', 'do not automatically open the site in browser')
  .option('-o, --one-page <file>', 'render and serve only a single page in the site')
  .option('-p, --port <port>', 'port for server to listen on (Default is 8080)')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .action((root, options) => {
    const rootFolder = path.resolve(root || process.cwd());
    const logsFolder = path.join(rootFolder, '_markbind/logs');
    const outputFolder = path.join(rootFolder, '_site');

    if (options.onePage) {
      // replace slashes for paths on Windows
      // eslint-disable-next-line no-param-reassign
      options.onePage = fsUtil.ensurePosix(options.onePage);
    }

    const site = new Site(rootFolder, outputFolder, options.onePage, options.forceReload, options.siteConfig);

    const addHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file add: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath)) {
          return site.rebuildAffectedSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const changeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file change: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath)) {
          return site.rebuildAffectedSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const removeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file deletion: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath)) {
          return site.rebuildAffectedSourceFiles(filePath);
        }
        return site.removeAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    // server config
    const serverConfig = {
      open: options.open && (options.onePage ? `/${options.onePage.replace(/\.(md|mbd)$/, '.html')}` : true),
      logLevel: 0,
      root: outputFolder,
      port: options.port || 8080,
      mount: [],
    };

    printHeader();

    site
      .readSiteConfig()
      .then((config) => {
        serverConfig.mount.push([config.baseUrl || '/', outputFolder]);
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
      .catch((error) => {
        logger.error(error.message);
      });
  });

program
  .command('deploy')
  .description('deploy the site to the repo\'s Github pages.')
  .action(() => {
    const rootFolder = path.resolve(process.cwd());
    const outputRoot = path.join(rootFolder, '_site');
    new Site(rootFolder, outputRoot).deploy()
      .then(() => {
        logger.info('Deployed!');
      })
      .catch((err) => {
        logger.error(err.message);
      });
    printHeader();
  });

program
  .command('build [root] [output]')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .description('build a website')
  .action((root, output, options) => {
    // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
    const baseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;
    const rootFolder = path.resolve(root || process.cwd());
    const defaultOutputRoot = path.join(rootFolder, '_site');
    const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
    printHeader();
    new Site(rootFolder, outputFolder)
      .generate(baseUrl)
      .then(() => {
        logger.info('Build success!');
      })
      .catch((error) => {
        logger.error(error.message);
      });
  });

program.parse(process.argv);

if (!program.args.length || !ACCEPTED_COMMANDS.includes(process.argv[2])) {
  if (program.args.length) {
    logger.warn(`Command '${program.args[0]}' doesn't exist, run "markbind --help" to list commands.`);
  } else {
    printHeader();
    program.help();
  }
}
