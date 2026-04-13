#!/usr/bin/env node

// Entry file for MarkBind project
import { program, Option } from 'commander';
import chalk from 'chalk';
import * as logger from './src/util/logger.js';
import { build } from './src/cmd/build.js';
import { deploy } from './src/cmd/deploy.js';
import { init } from './src/cmd/init.js';
import { serve } from './src/cmd/serve.js';
import { install as installSkills } from './src/cmd/skills.js';
import packageJson from './package.json' with { type: 'json' };
import { checkbox } from '@inquirer/prompts';

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
    styleTitle: str => chalk.bold.cyan(str),
    styleUsage: str => chalk.white(str),
    styleOptionText: str => chalk.yellow(str),
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
  .addOption(
    program.createOption('-f, --force-reload',
                         'force a full reload of all site files when a file is changed')
      .conflicts('onePage'))

  .addOption(
    program.createOption('-o, --one-page [file]',
                         'build and serve only a single page in the site initially, '
      + 'building more pages when they are navigated to. Also lazily rebuilds only '
      + 'the page being viewed when there are changes to the source files (if needed), '
      + 'building others when navigated to'))

  .addOption(
    program.createOption('-b, --background-build',
                         'when --one-page is specified, enhances one-page serve by building '
      + 'remaining pages in the background'))

  .optionsGroup('Server Options')
  .addOption(
    program.createOption('-n, --no-open', 'do not automatically open the site in browser'))
  .addOption(
    program.createOption('-p, --port <port>', 'port for server to listen on (Default is 8080)'))
  .addOption(
    program.createOption('-a, --address <address>', 'specify the server address/host (Default is 127.0.0.1)'))
  .addOption(
    program.createOption('-s, --site-config <file>', 'specify the site config file (default: site.json)'))
  .addOption(
    program.createOption('-v, --verbose', 'enable verbose logging (e.g., page building logs)'))
  // Development mode is hidden as it is not user facing and only works in local development environment
  .addOption(
    new Option('-d, --dev', 'development mode, enabling live & hot reload for frontend source files.')
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
  .option('-v, --verbose', 'enable verbose logging (e.g., page building logs)')
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
  .option('-v, --verbose', 'enable verbose logging (e.g., page building logs)')
  .summary('Deploy the latest build of the site to GitHub Pages')
  .description('Deploy the latest build of the site to the repo\'s GitHub Pages')
  .action((userSpecifiedRoot, options) => {
    deploy(userSpecifiedRoot, options);
  });

const skillsCmd = program
  .commandsGroup('Setup Commands')
  .command('skills')
  .summary('Manage AI coding skills for this project')
  .description('Download and manage AI coding skills from the MarkBind skills repository');

const agentChoices =
  [
    { name: "Augment", value: ".augment" },
    { name: "IBM Bob", value: ".bob" },
    { name: "Claude Code", value: ".claude" },
    { name: "OpenClaw", value: "." },
    { name: "CodeBuddy", value: ".codebuddy" },
    { name: "Command Code", value: ".commandcode" },
    { name: "Continue", value: ".continue" },
    { name: "Cortex Code", value: ".cortex" },
    { name: "Crush", value: ".crush" },
    { name: "Droid", value: ".factory" },
    { name: "Goose", value: ".goose" },
    { name: "Junie", value: ".junie" },
    { name: "iFlow CLI", value: ".iflow" },
    { name: "Kilo Code", value: ".kilocode" },
    { name: "Kiro CLI", value: ".kiro" },
    { name: "Kode", value: ".kode" },
    { name: "MCPJam", value: ".mcpjam" },
    { name: "Mistral Vibe", value: ".vibe" },
    { name: "Mux", value: ".mux" },
    { name: "OpenHands", value: ".openhands" },
    { name: "Pi", value: ".pi" },
    { name: "Qoder", value: ".qoder" },
    { name: "Qwen Code", value: ".qwen" },
    { name: "Roo Code", value: ".roo" },
    { name: "Trae", value: ".trae" },
    { name: "Trae CN", value: ".trae" },
    { name: "Windsurf", value: ".windsurf" },
    { name: "Zencoder", value: ".zencoder" },
    { name: "Neovate", value: ".neovate" },
    { name: "Pochi", value: ".pochi" },
    { name: "AdaL", value: ".adal" }
  ];

skillsCmd
  .command('install')
  .option('--ref <ref>', 'specify a git ref (tag or branch) instead of auto-resolving from MarkBind version')
  .option('--force', 'overwrite existing skills')
  .summary('Install AI coding skills into .claude/skills/')
  .description('Download skills from MarkBind/markbind-skills and install into .claude/skills/')
  .action(async (options) => {
    const agent = await checkbox({
      message: `
── Universal (.agents/skills) ── always included ────────────
  • Amp
  • Antigravity
  • Cline
  • Codex
  • Cursor
  • Deep Agents
  • Firebender
  • Gemini CLI
  • GitHub Copilot
  • Kimi Code CLI
  • OpenCode
  • Warp

── Additional agents ─────────────────────────────`,
      choices: agentChoices,
    })
    installSkills({ ...options, agents: agent });
  });

skillsCmd
  .command('update')
  .option('--ref <ref>', 'specify a git ref (tag or branch) instead of auto-resolving from MarkBind version')
  .summary('Update installed skills to match current MarkBind version')
  .description('Re-download skills matching the current MarkBind CLI version,'
    + 'overwriting any existing installation')
  .action(async (options) => {
    installSkills({ ...options, force: true });
  });

program.parse(process.argv);
