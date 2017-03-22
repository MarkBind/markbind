#!/usr/bin/env node
'use strict';

// Entry file for Markbind project
const clear = require('clear');
const fs = require('fs-extra-promise');
const path = require('path');
const Promise = require('bluebird');
const program = require('commander');
const html = require('html');
const liveServer = require('live-server');
const chokidar = require('chokidar');

const logger = require('./lib/util/logger');
const fsUtil = require('./lib/util/fsUtil');
const Site = require('./lib/Site');
const MarkBind = require('markbind');

const CLI_VERSION = require('./package.json').version;
const ACCEPTED_COMMANDS = ['version', 'include', 'render', 'init', 'build', 'serve', 'deploy'];

let markbinder = new MarkBind();

clear();

process.title = 'MarkBind';
process.stdout.write(
  String.fromCharCode(27) + ']0;' + 'MarkBind' + String.fromCharCode(7)
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
  .action(function (file, options) {
    markbinder.includeFile(path.resolve(process.cwd(), file))
      .then((result) => {
        if (options.output) {
          let outputPath = path.resolve(process.cwd(), options.output);
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
        return;
      });
  });

program
  .command('render <file>')
  .description('render the given file')
  .option('-o, --output <path>', 'output file path')
  .action(function (file, options) {
    markbinder.renderFile(path.resolve(process.cwd(), file))
      .then((result) => {
        result = html.prettyPrint(result, {indent_size: 2});
        if (options.output) {
          let outputPath = path.resolve(process.cwd(), options.output);
          fs.outputFileSync(outputPath, result);
          logger.logo();
          logger.info(`Result was written to ${outputPath}`);
        } else {
          logger.log(result);
        }
      })
      .catch((error) => {
        logger.error('Error processing file rendering:');
        logger.error(error.message);
        return;
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
    const outputFolder = path.join(rootFolder, '_site');

    let site = new Site(rootFolder, outputFolder);

    let changeHandler = (path) => {
      logger.info(`Reload for file change: ${path}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isMarkdown(path) || fsUtil.isHtml(path)) {
          return site.buildSourceFiles()
        } else {
          return site.buildAsset(path);
        }
      }).catch((err) => {
        logger.error(err.message)
      });
    };

    let removeHandler = (path) => {
      logger.info(`Reload for file deletion: ${path}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isMarkdown(path) || fsUtil.isHtml(path)) {
          return site.buildSourceFiles()
        } else {
          return site.removeAsset(path);
        }
      }).catch((err) => {
        logger.error(err.message)
      });
    };

    // server conifg
    let serverConfig = {
      open: options.open,
      logLevel: 0,
      root: outputFolder,
      port: options.port || 8080,
      mount: []
    };

    logger.logo();

    site
      .readSiteConfig()
      .then((config) => {
        serverConfig.mount.push([config.baseUrl || '/', outputFolder]);
        return site.generate();
      })
      .then(() => {
        var watcher = chokidar.watch(rootFolder, {
          ignored: [outputFolder, /(^|[\/\\])\../],
          ignoreInitial: true
        });
        watcher
          .on('add', changeHandler)
          .on('change', changeHandler)
          .on('unlink', removeHandler);
      })
      .then(() => {
        let server = liveServer.start(serverConfig);
        server.addListener('listening', function () {
          var address = server.address();
          var serveHost = address.address === '0.0.0.0' ? '127.0.0.1' : address.address;
          var serveURL = 'http://' + serveHost + ':' + address.port;
          logger.info(`Serving \"${outputFolder}\" at ${serveURL}`)
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
        logger.info('Deployed!')
      })
      .catch((err) => {
        logger.error(err.message);
      });
    logger.logo();
  });

program
  .command('build [root] [output]')
  .description('build a website')
  .action((root, output) => {
    const rootFolder = path.resolve(root || process.cwd());
    const defaultOutputRoot = path.join(rootFolder, '_site');
    const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
    logger.logo();
    new Site(rootFolder, outputFolder)
      .generate()
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
