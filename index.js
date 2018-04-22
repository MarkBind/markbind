#!/usr/bin/env node


// Entry file for Markbind project
const chokidar = require('chokidar');
const clear = require('clear');
const fs = require('fs-extra-promise');
const htmlBeautify = require('js-beautify').html;
const liveServer = require('live-server');
const path = require('path');
const program = require('commander');
const Promise = require('bluebird');

const _ = {};
_.isBoolean = require('lodash/isBoolean');

const fsUtil = require('./lib/util/fsUtil');
const logger = require('./lib/util/logger');
const MarkBind = require('./lib/markbind/lib/parser');
const Site = require('./lib/Site');

const CLI_VERSION = require('./package.json').version;

const ACCEPTED_COMMANDS = ['version', 'include', 'render', 'init', 'build', 'serve', 'deploy'];

const markbinder = new MarkBind();

clear();

process.title = 'MarkBind';
process.stdout.write(
  `${String.fromCharCode(27)}]0; MarkBind${String.fromCharCode(7)}`,
);

program
  .allowUnknownOption()
  .usage(' <command>');

program
  .version(CLI_VERSION);

program
  .command('include <file>')
  .description('process all the fragment include in the given file')
  .option('-o, --output <path>', 'output file path')
  .action((file, options) => {
    markbinder.includeFile(path.resolve(process.cwd(), file))
      .then((result) => {
        if (options.output) {
          const outputPath = path.resolve(process.cwd(), options.output);
          fs.outputFileSync(outputPath, result);
          logger.logo();
          logger.info(`Result was written to ${outputPath}`);
        } else {
          logger.log(result);
        }
      })
      .catch((error) => {
        logger.logo();
        logger.error('Error processing fragment include:');
        logger.error(error.message);
      });
  });

program
  .command('render <file>')
  .description('render the given file')
  .option('-o, --output <path>', 'output file path')
  .action((file, options) => {
    markbinder.renderFile(path.resolve(process.cwd(), file))
      .then((result) => {
        const formattedResult = htmlBeautify(result, { indent_size: 2 });
        if (options.output) {
          const outputPath = path.resolve(process.cwd(), options.output);
          fs.outputFileSync(outputPath, formattedResult);
          logger.logo();
          logger.info(`Result was written to ${outputPath}`);
        } else {
          logger.log(formattedResult);
        }
      })
      .catch((error) => {
        logger.error('Error processing file rendering:');
        logger.error(error.message);
      });
  });

program
  .command('init [root]')
  .description('init a markbind website project')
  .action((root) => {
    const rootFolder = path.resolve(root || process.cwd());
    logger.logo();
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
  .option('-p, --port <port>', 'port for server to listen on (Default is 8080)')
  .option('--no-open', 'do not automatically open the site in browser')
  .action((root, options) => {
    const rootFolder = path.resolve(root || process.cwd());
    const logsFolder = path.join(rootFolder, '_markbind/logs');
    const outputFolder = path.join(rootFolder, '_site');

    const site = new Site(rootFolder, outputFolder);

    const addHandler = (filePath) => {
      logger.info(`Reload for file add: ${filePath}`);
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
      logger.info(`Reload for file change: ${filePath}`);
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
      logger.info(`Reload for file deletion: ${filePath}`);
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
      open: options.open,
      logLevel: 0,
      root: outputFolder,
      port: options.port || 8080,
      mount: [],
    };

    logger.logo();

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
    logger.logo();
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
    logger.logo();
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
    logger.warn(`Command '${program.args[0]}' doesn't exist, run "markbind help" to list commands.`);
  } else {
    logger.logo();
    program.help();
  }
}
