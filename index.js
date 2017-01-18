#!/usr/bin/env node
'use strict';

// Entry file for Markbind project
const clear = require('clear');
const fs = require('fs-extra-promise');
const path = require('path');
const program = require('commander');
const html = require('html');
const liveServer = require('live-server');
const chokidar = require('chokidar');

const logger = require('./lib/util/logger');
const Site = require('./lib/Site');
const MarkBind = require('markbind');

const CLI_VERSION = require('./package.json').version;
const ACCEPTED_COMMANDS = ['version', 'include', 'render', 'init', 'build', 'serve'];

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
  .version(CLI_VERSION)
  .option('-o, --output <path>', 'output file path')
  .action(function (file) {
    printInfo('Please first run include command, then run render command on the include result');
  });

program
  .command('include <file>')
  .description('process all the include in the given file')
  .action(function (file) {
    markbinder.includeFile(path.resolve(process.cwd(), file))
      .then((result) => {
        if (program.output) {
          let outputPath = path.resolve(process.cwd(), program.output);
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
  .action(function (file) {
    markbinder.renderFile(path.resolve(process.cwd(), file))
      .then((result) => {
        result = html.prettyPrint(result, {indent_size: 2});
        if (program.output) {
          let outputPath = path.resolve(process.cwd(), program.output);
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
  .action((root) => {
    const rootFolder = path.resolve(root || process.cwd());
    const outputFolder = path.join(rootFolder, '_site');

    let site = new Site(rootFolder, outputFolder);

    let changeHandler = (path) => {
      logger.info(`Reload for file change: ${path}`);
      site.reloadSourceFiles().catch((err) => {
        logger.error(err.message)
      });
    };


    site
      .generate()
      .then(() => {
        var watcher = chokidar.watch(rootFolder, {
          ignored: [outputFolder, /(^|[\/\\])\../],
          ignoreInitial: true
        });
        watcher
          .on('add', changeHandler)
          .on('change', changeHandler)
          .on('unlink', changeHandler);
      })
      .then(() => {
        let server = liveServer.start({
          open: true,
          logLevel: 0,
          root: outputFolder,
        });
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
