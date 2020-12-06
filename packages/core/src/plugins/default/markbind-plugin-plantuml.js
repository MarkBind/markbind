/**
 * Parses PlantUML diagrams
 * Replaces <puml> tags with <pic> tags with the appropriate src attribute and generates the diagrams
 * by running the JAR executable
 */
const cheerio = module.parent.require('cheerio');
const fs = require('fs');
const path = require('path');
const ensurePosix = require('ensure-posix-path');
const { exec } = require('child_process');
const cryptoJS = require('crypto-js');

const logger = require('../../utils/logger');
const fsUtil = require('../../utils/fsUtil');
const utils = require('../../utils');

const JAR_PATH = path.resolve(__dirname, 'plantuml.jar');

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
  const cmd = `java -jar "${JAR_PATH}" -nometadata -pipe > "${imageOutputPath}"`;
  const childProcess = exec(cmd);

  let errorLog = '';
  childProcess.stdin.write(
    content,
    (e) => {
      if (e) {
        logger.debug(e);
        logger.error(`Error generating ${imageOutputPath}`);
      }
      childProcess.stdin.end();
    },
  );

  childProcess.on('error', (error) => {
    logger.debug(error);
    logger.error(`Error generating ${imageOutputPath}`);
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
  tagConfig: {
    puml: {
      isSpecial: true,
      attributes: [
        {
          name: 'name',
          isRelative: true,
        },
        {
          name: 'src',
          isRelative: true,
          isSourceFile: true,
        },
      ],
    },
  },

  beforeSiteGenerate: () => {
    processedDiagrams.clear();
  },

  processNode: (pluginContext, node, config) => {
    if (node.name !== 'puml') {
      return;
    }
    node.name = 'pic';

    let pumlContent;
    let pathFromRootToImage;
    if (node.attribs.src) {
      const srcWithoutBaseUrl = utils.stripBaseUrl(node.attribs.src, config.baseUrl);
      const srcWithoutLeadingSlash = srcWithoutBaseUrl.startsWith('/')
        ? srcWithoutBaseUrl.substring(1)
        : srcWithoutBaseUrl;

      const rawPath = path.resolve(config.rootPath, srcWithoutLeadingSlash);
      try {
        pumlContent = fs.readFileSync(rawPath, 'utf8');
      } catch (err) {
        logger.debug(err);
        logger.error(`Error reading ${rawPath} for <puml> tag`);
        return;
      }

      pathFromRootToImage = fsUtil.setExtension(srcWithoutLeadingSlash, '.png');
      node.attribs.src = ensurePosix(fsUtil.setExtension(node.attribs.src, '.png'));
    } else {
      pumlContent = cheerio(node).text();

      if (node.attribs.name) {
        const nameWithoutBaseUrl = utils.stripBaseUrl(node.attribs.name, config.baseUrl);
        const nameWithoutLeadingSlash = nameWithoutBaseUrl.startsWith('/')
          ? nameWithoutBaseUrl.substring(1)
          : nameWithoutBaseUrl;
        pathFromRootToImage = ensurePosix(fsUtil.setExtension(nameWithoutLeadingSlash, '.png'));

        delete node.attribs.name;
      } else {
        const normalizedContent = pumlContent.replace(/\r\n/g, '\n');
        const hashedContent = cryptoJS.MD5(normalizedContent).toString();
        pathFromRootToImage = `${hashedContent}.png`;
      }

      node.attribs.src = `${config.baseUrl}/${pathFromRootToImage}`;
    }

    delete node.children;

    const imageOutputPath = path.resolve(config.outputPath, pathFromRootToImage);
    generateDiagram(imageOutputPath, pumlContent);
  },
};
