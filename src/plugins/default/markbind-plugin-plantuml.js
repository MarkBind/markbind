/**
 * Parses PlantUML diagrams
 * Replaces <puml> tags with <pic> tags with the appropriate src attribute and generates the diagrams
 * by running the JAR executable
 */
const cheerio = module.parent.require('cheerio');
const fs = require('fs');
const path = require('path');

const { exec } = require('child_process');
const logger = require('../../util/logger');
const pluginUtil = require('../../util/pluginUtil');

const JAR_PATH = path.resolve(__dirname, 'plantuml.jar');

const {
  ERR_PROCESSING,
} = require('../../constants');

// Tracks diagrams that have already been processed
const processedDiagrams = new Set();

/**
 * Generates diagram and returns the file name of the diagram
 * @param fileName name of the file to be generated
 * @param content puml dsl used to generate the puml diagram
 * @param config sourcePath and resultPath from parser context
 * @returns {string} file name of diagram
 */
function generateDiagram(fileName, content, config) {
  const { resultPath } = config;

  const outputDir = path.join(path.dirname(resultPath), path.dirname(fileName));
  // Path of the .puml file
  const outputFilePath = path.join(outputDir, path.basename(fileName));
  // Tracks built files to avoid accessing twice
  if (processedDiagrams.has(outputFilePath)) { return fileName; }
  processedDiagrams.add(outputFilePath);

  // Creates output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Java command to launch PlantUML jar
  const cmd = `java -jar "${JAR_PATH}" -pipe > "${outputFilePath}"`;
  const childProcess = exec(cmd);

  let errorLog = '';
  childProcess.stdin.write(
    content,
    (e) => {
      if (e) {
        logger.debug(e);
        logger.error(`${ERR_PROCESSING} ${fileName}`);
      }
      childProcess.stdin.end();
    },
  );

  childProcess.on('error', (error) => {
    logger.debug(error);
    logger.error(`${ERR_PROCESSING} ${fileName}`);
  });

  childProcess.stderr.on('data', (errorMsg) => {
    errorLog += errorMsg;
  });

  childProcess.on('exit', () => {
    // This goes to the log file, but not shown on the console
    logger.debug(errorLog);
  });

  return fileName;
}

module.exports = {
  preRender: (content, pluginContext, frontmatter, config) => {
    // Clear <puml> tags processed before for live reload
    processedDiagrams.clear();
    // Processes all <puml> tags
    const $ = cheerio.load(content, { xmlMode: true });
    $('puml').each((i, tag) => {
      tag.name = 'pic';
      const { cwf } = tag.attribs;
      const pumlContent = pluginUtil.getPluginContent($, tag, cwf);

      const filePath = pluginUtil.getFilePathForPlugin(tag.attribs, pumlContent);

      tag.attribs.src = generateDiagram(filePath, pumlContent, config);
      tag.children = [];
    });

    return $.html();
  },
  getSources: () => ({
    tagMap: [['puml', 'src']],
  }),

  getSpecialTags: () => ['puml'],
};
