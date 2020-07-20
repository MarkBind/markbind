/**
 * Parses PlantUML diagrams
 * Replaces <puml> tags with <pic> tags with the appropriate src attribute and generates the diagrams
 * by running the JAR executable
 */
const cheerio = module.parent.require('cheerio');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const { ensurePosix } = require('../../utils');
const logger = require('../../utils/logger');
const pluginUtil = require('../utils');

const JAR_PATH = path.resolve(__dirname, 'plantuml.jar');

const {
  ERR_PROCESSING,
} = require('../../constants');

const processedDiagrams = new Set();

/**
 * Generates diagram and returns the file name of the diagram
 * @param imageOutputPath output path of the diagram to be generated
 * @param content puml dsl used to generate the puml diagram
 */
function generateDiagram(imageOutputPath, content) {
  // Avoid generating twice
  if (processedDiagrams.has(imageOutputPath)) { return; }
  processedDiagrams.add(imageOutputPath);

  // Creates output dir if it doesn't exist
  const outputDir = path.dirname(imageOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Java command to launch PlantUML jar
  const cmd = `java -jar "${JAR_PATH}" -pipe > "${imageOutputPath}"`;
  const childProcess = exec(cmd);

  let errorLog = '';
  childProcess.stdin.write(
    content,
    (e) => {
      if (e) {
        logger.debug(e);
        logger.error(`${ERR_PROCESSING} ${imageOutputPath}`);
      }
      childProcess.stdin.end();
    },
  );

  childProcess.on('error', (error) => {
    logger.debug(error);
    logger.error(`${ERR_PROCESSING} ${imageOutputPath}`);
  });

  childProcess.stderr.on('data', (errorMsg) => {
    errorLog += errorMsg;
  });

  childProcess.on('exit', () => {
    // This goes to the log file, but not shown on the console
    logger.debug(errorLog);
  });
}

module.exports = {
  preRender: (content, pluginContext, frontmatter, config) => {
    processedDiagrams.clear();

    // Processes all <puml> tags
    const $ = cheerio.load(content);
    $('puml').each((i, tag) => {
      tag.name = 'pic';
      const { cwf } = tag.attribs;
      const pumlContent = pluginUtil.getSrcOrTextContent($, tag, cwf);

      const imageFileName = pluginUtil.getPngFileName(tag.attribs, pumlContent);
      const cwd = path.dirname(cwf);
      const pathFromRootToCwd = path.relative(config.rootPath, cwd);
      const pathFromRootToImage = path.join(pathFromRootToCwd, imageFileName);

      tag.attribs.src = path.posix.join(`${config.baseUrl}/`, ensurePosix(pathFromRootToImage));
      tag.children = [];

      const imageOutputPath = path.resolve(config.siteOutputPath, pathFromRootToImage);
      generateDiagram(imageOutputPath, pumlContent);
    });

    return $.html();
  },
  getSources: () => ({
    tagMap: [['puml', 'src']],
  }),

  getSpecialTags: () => ['puml'],
};
