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

const {
  ERR_PROCESSING,
  ERR_READING,
} = require('../../constants');

// Tracks diagrams that have already been processed
const processedDiagrams = new Set();

/**
 * Generates diagram and replaces src attribute of puml tag
 * @param src src attribute of the puml tag
 * @param cwf original file that contains the puml tag, we resolve relative src to this file
 * @param config sourcePath and resultPath from parser context
 * @returns {string} resolved src attribute
 */
function generateDiagram(src, cwf, config) {
  const { sourcePath, resultPath } = config;
  const _cwf = cwf || sourcePath;

  // For replacing img.src
  const diagramSrc = src.replace('.mmd', '.png');
  // Path of the .puml file
  const rawDiagramPath = path.resolve(path.dirname(_cwf), src);
  // Path of the .png to be generated
  const outputFilePath = path.resolve(resultPath, path.relative(sourcePath, rawDiagramPath)
    .replace('.mmd', '.png'));
  // Output dir for the png file
  const outputDir = path.dirname(outputFilePath);

  // Tracks built files to avoid accessing twice
  if (processedDiagrams.has(outputFilePath)) { return diagramSrc; }
  processedDiagrams.add(outputFilePath);

  // Creates output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read diagram file, launch PlantUML jar
  fs.readFile(rawDiagramPath, (err, data) => {
    if (err) {
      logger.debug(err);
      logger.error(`${ERR_READING} ${rawDiagramPath}`);
      return;
    }

    fs.writeFileSync('./tempInput.mmd', data.toString());

    // mermaid cli
    const cmd = `mmdc -i ./tempInput.mmd -o ${outputFilePath}`;
    const childProcess = exec(cmd);

    let errorLog = '';

    childProcess.on('error', (error) => {
      logger.debug(error);
      logger.error(`${ERR_PROCESSING} ${rawDiagramPath}`);
    });

    childProcess.stderr.on('data', (errorMsg) => {
      errorLog += errorMsg;
    });

    childProcess.on('exit', () => {
      // This goes to the log file, but not shown on the console
      fs.unlinkSync('./tempInput.mmd');
      console.log(errorLog);
      logger.debug(errorLog);
    });
  });

  return diagramSrc;
}

module.exports = {
  preRender: (content, pluginContext, frontmatter, config) => {
    // Clear <puml> tags processed before for live reload
    processedDiagrams.clear();
    // Processes all <puml> tags
    const $ = cheerio.load(content, { xmlMode: true });
    $('mermaid').each((i, tag) => {
      // eslint-disable-next-line no-param-reassign
      tag.name = 'pic';
      const { src, cwf } = tag.attribs;
      // eslint-disable-next-line no-param-reassign
      tag.attribs.src = generateDiagram(src, cwf, config);
    });

    return $.html();
  },
  getSources: () => ({
    tagMap: [['mermaid', 'src']],
  }),
};
