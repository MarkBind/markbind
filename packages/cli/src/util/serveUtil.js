#!/usr/bin/env node

// Entry file for MarkBind project
const program = require('commander');

const logger = require('./src/util/logger');
const { build } = require('./src/cmd/build');
const { deploy } = require('./src/cmd/deploy');
const { init } = require('./src/cmd/init');
const { serve } = require('./src/cmd/serve');

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
  .addHelpText('beforeAll', printHeader())
  .showHelpAfterError('(run "markbind --help" to list commands)');

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
    init(root, options);
  });

program
  .command('serve [root]')
  .alias('s')
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
  .description('build then serve a website from a directory')
  .action((userSpecifiedRoot, options) => {
    serve(userSpecifiedRoot, options);
  });

program
  .command('build [root] [output]')
  .alias('b')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .description('build a website')
  .action((userSpecifiedRoot, output, options) => {
    build(userSpecifiedRoot, output, options);
  });

program
  .command('deploy [root]')
  .alias('d')
  .option('-c, --ci [githubTokenName]', 'deploy the site in CI Environment [GITHUB_TOKEN]')
  .option('-n, --no-build', 'do not automatically build the site before deployment')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .description('deploy the latest build of the site to the repo\'s Github pages')
  .action((userSpecifiedRoot, options) => {
    deploy(userSpecifiedRoot, options);
  });

program.parse(process.argv);
