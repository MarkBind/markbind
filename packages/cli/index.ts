#!/usr/bin/env node

// Entry file for MarkBind project
import { program, Option } from 'commander';
import chalk from 'chalk';
import * as logger from './src/util/logger.js';
import { build } from './src/cmd/build.js';
import { deploy } from './src/cmd/deploy.js';
import { init } from './src/cmd/init.js';
import { serve } from './src/cmd/serve.js';
import packageJson from './package.json' with { type: 'json' };

const CLI_VERSION = packageJson.version;

process.title = 'MarkBind';
process.stdout.write(
  `${String.fromCharCode(27)}]0; MarkBind${String.fromCharCode(7)}`,
);

function printHeader() {
  logger.logo();
  logger.log(` v${CLI_VERSION}`);
  return '';
}

program
  .addHelpText('beforeAll', printHeader())
  .showHelpAfterError('(run "markbind --help" to list commands)')
  .configureHelp({
    styleTitle: (str) => chalk.bold.cyan(str),
    styleUsage: (str) => chalk.white(str),
    styleOptionText: (str) => chalk.yellow(str),
  });

program
  .allowUnknownOption()
  .usage('<command>');

program
  .name('markbind')
  .version(CLI_VERSION);

program
  .commandsGroup('Setup Commands')
  .command('init [root]')
  .option('-c, --convert', 'convert a GitHub wiki or docs folder to a MarkBind website')
  .option('-t, --template <type>', 'initialise markbind with a specified template', 'default')
  .alias('i')
  .summary('init a markbind site')
  .description('init a markbind website project')
  .action((root, options) => {
    init(root, options);
  });

program
  .commandsGroup('Site Commands')
  .command('serve [root]')
  .alias('s')
  .summary('Build then serve a website from a directory')
  .description('Build and serve a website from a directory')

  .optionsGroup('Build Options')
  .addOption(program.createOption('-f, --force-reload', 'force a full reload of all site files when a file is changed')
    .conflicts('onePage'))
  .addOption(program.createOption('-o, --one-page [file]', 'build and serve only a single page in the site initially, '
      + 'building more pages when they are navigated to. Also lazily rebuilds only the page being viewed when '
      + 'there are changes to the source files (if needed), building others when navigated to'))
  .addOption(program.createOption('-b, --background-build', 'when --one-page is specified, enhances one-page serve by building '
      + 'remaining pages in the background'))

  .optionsGroup('Server Options')
  .addOption(program.createOption('-n, --no-open', 'do not automatically open the site in browser'))
  .addOption(program.createOption('-p, --port <port>', 'port for server to listen on (Default is 8080)'))
  .addOption(program.createOption('-a, --address <address>', 'specify the server address/host (Default is 127.0.0.1)'))
  .addOption(program.createOption('-s, --site-config <file>', 'specify the site config file (default: site.json)'))

  // Development mode is hidden as it is not user facing and only works during local development
  .addOption(new Option('-d, --dev', 'development mode, enabling live & hot reload for frontend source files.')
    .hideHelp())
  .action((userSpecifiedRoot, options) => {
    serve(userSpecifiedRoot, options);
  });

program
  .command('build [root] [output]')
  .alias('b')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .summary('Build a website')
  .description('Build a website')
  .action((userSpecifiedRoot, output, options) => {
    build(userSpecifiedRoot, output, options);
  });

program
  .command('deploy [root]')
  .alias('d')
  .option('-c, --ci [githubTokenName]', 'deploy the site in CI Environment [GITHUB_TOKEN]')
  .option('-n, --no-build', 'do not automatically build the site before deployment')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .summary('Deploy the latest build of the site to Github pages')
  .description('Deploy the latest build of the site to the repo\'s Github pages')
  .action((userSpecifiedRoot, options) => {
    deploy(userSpecifiedRoot, options);
  });

program.parse(process.argv);
