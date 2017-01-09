#!/usr/bin/env node
'use strict';

// Entry file for Markbind project
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const html = require('html');

const MarkBind = require('markbind');

let markbindParser = new MarkBind();

clear();

function printLogo() {
  console.log(
    chalk.yellow(
      figlet.textSync('MarkBind', {horizontalLayout: 'full'})
    )
  );
}

program
  .version('0.1.0')
  .option('-o, --output <path>', 'output file path')
  .arguments('<file>')
  .action(function (file) {
    console.log('Please first run include command, then run render command for the include result');
  });

program
  .command('include <file>')
  .description('process all the include in the given file')
  .action(function (file) {
    markbindParser.includeFile(path.resolve(process.cwd(), file), (error, result) => {
      if (error) {
        console.log(chalk.red('Error processing file including:'));
        console.log(chalk.red(error.message));
        return;
      }
      if (program.output) {
        printLogo();
        let outputPath = path.resolve(process.cwd(), program.output);
        try {
          fs.statSync(path.dirname(outputPath));
        } catch (error) {
          fs.mkdirSync(path.dirname(outputPath));
        }
        console.log(chalk.cyan('Result was written to ' + outputPath));
        fs.writeFileSync(outputPath, result);
      } else {
        console.log(result);
      }
    });
  });

program
  .command('render <file>')
  .description('render the given file')
  .action(function (file) {
    // TODO: need to check file existence
    let output = program.output || 'output';
    markbindParser.renderFile(path.resolve(process.cwd(), file), (error, result) => {
      if (error) {
        console.log(chalk.red('Error processing file rendering:'));
        console.log(chalk.red(error.message));
        return;
      }
      result = html.prettyPrint(result, {indent_size: 2});
      if (program.output) {
        printLogo();
        let outputPath = path.resolve(process.cwd(), program.output);
        try {
          fs.statSync(path.dirname(outputPath));
        } catch (error) {
          fs.mkdirSync(path.dirname(outputPath));
        }
        console.log(chalk.cyan('Result was written to ' + outputPath));
        fs.writeFileSync(outputPath, result);
      } else {
        console.log(result);
      }
    });
  });

if (typeof cmdValue === 'undefined') {
  // TODO: Handle illegal command
  // process.exit(1);
}

program.parse(process.argv);
