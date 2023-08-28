/**
 * Parses PlantUML diagrams
 * Replaces <puml> tags with <pic> tags with the appropriate src attribute and generates the diagrams
 * by running the JAR executable
 */
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import cryptoJS from 'crypto-js';

import * as fsUtil from '../../utils/fsUtil';
import * as logger from '../../utils/logger';
import * as urlUtil from '../../utils/urlUtil';
import { PluginContext } from '../Plugin';
import { NodeProcessorConfig } from '../../html/NodeProcessor';
import { MbNode } from '../../utils/node';
import LockManager from '../../utils/LockManager';

interface DiagramStatus {
  hashKey: string;
}

const JAR_PATH = path.resolve(__dirname, 'plantuml.jar');

const PUML_EXT = '.png';

/**
* This Map maintains a record of processed diagrams. When a diagram is generated or regenerated,
* it's added to this map. Subsequently, if a PUML or non-PUML file is edited, leading to a hot reload,
* the generateDiagram function can avoid redundant regeneration by checking this map.
* If the diagram's identifier is present in the map,
* the generation process is bypassed, thus preventing duplicates.
 */
const processedDiagrams = new Map<string, DiagramStatus>();

let graphvizCheckCompleted = false;

/**
 * Generates diagram and returns the file name of the diagram
 * @param imageOutputPath output path of the diagram to be generated
 * @param content puml dsl used to generate the puml diagram
 */
function generateDiagram(imageOutputPath: string, content: string) {
  const hashKey = cryptoJS.MD5(imageOutputPath + content).toString();

  // Avoid generating twice
  if (processedDiagrams.has(imageOutputPath) && processedDiagrams.get(imageOutputPath)?.hashKey === hashKey) {
    return;
  }

  // Creates output dir if it doesn't exist
  const outputDir = path.dirname(imageOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const lockId = LockManager.createLock();

  // Add new diagram to the map
  processedDiagrams.set(imageOutputPath, { hashKey });

  // Java command to launch PlantUML jar
  const cmd = `java -jar "${JAR_PATH}" -nometadata -pipe > "${imageOutputPath}"`;
  const childProcess = exec(cmd, {
    cwd: outputDir, // Invoke image generation in the same directory to avoid file inclusion issues
  });

  let errorLog = '';
  childProcess.stdin?.write(
    content,
    (e) => {
      if (e) {
        logger.debug(e as unknown as string);
        logger.error(`Error generating ${imageOutputPath}`);
      }
      childProcess.stdin?.end();
    },
  );

  childProcess.on('error', (error) => {
    logger.debug(error as unknown as string);
    logger.error(`Error generating ${imageOutputPath}`);
    LockManager.deleteLock(lockId);
  });

  childProcess.stderr?.on('data', (errorMsg) => {
    errorLog += errorMsg;
  });

  childProcess.on('exit', () => {
    // This goes to the log file, but not shown on the console
    logger.debug(errorLog);
    LockManager.deleteLock(lockId);
  });
}

export = {
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
    graphvizCheckCompleted = false;
  },

  processNode: (_pluginContext: PluginContext, node: MbNode, config: NodeProcessorConfig) => {
    if (node.name !== 'puml') {
      return;
    }
    if (config.plantumlCheck && !graphvizCheckCompleted) {
      exec(`java -jar "${JAR_PATH}" -testdot`, (_error, _stdout, stderr) => {
        if (stderr.includes('Error: No dot executable found')) {
          logger.warn('You are using PlantUML diagrams but Graphviz is not installed!');
        }
      });
      graphvizCheckCompleted = true;
    }

    node.name = 'pic';

    let pumlContent;
    let pathFromRootToImage;

    if (node.attribs.src) {
      const srcWithoutBaseUrl = urlUtil.stripBaseUrl(node.attribs.src, config.baseUrl);
      const srcWithoutLeadingSlash = srcWithoutBaseUrl.startsWith('/')
        ? srcWithoutBaseUrl.substring(1)
        : srcWithoutBaseUrl;

      const rawPath = path.resolve(config.rootPath, srcWithoutLeadingSlash);
      try {
        pumlContent = fs.readFileSync(rawPath, 'utf8');
      } catch (err) {
        logger.debug(err as string);
        logger.error(`Error reading ${rawPath} for <puml> tag`);
        return;
      }

      pathFromRootToImage = fsUtil.setExtension(srcWithoutLeadingSlash, PUML_EXT);
      node.attribs.src = fsUtil.ensurePosix(fsUtil.setExtension(node.attribs.src, PUML_EXT));
    } else {
      pumlContent = cheerio(node).text();

      if (node.attribs.name) {
        const nameWithoutBaseUrl = urlUtil.stripBaseUrl(node.attribs.name, config.baseUrl);
        const nameWithoutLeadingSlash = nameWithoutBaseUrl.startsWith('/')
          ? nameWithoutBaseUrl.substring(1)
          : nameWithoutBaseUrl;
        pathFromRootToImage = fsUtil.ensurePosix(fsUtil.setExtension(nameWithoutLeadingSlash, PUML_EXT));

        delete node.attribs.name;
      } else {
        const normalizedContent = pumlContent.replace(/\r\n/g, '\n');
        const hashedContent = cryptoJS.MD5(normalizedContent).toString();
        pathFromRootToImage = `${hashedContent}${PUML_EXT}`;
      }

      node.attribs.src = `${config.baseUrl}/${pathFromRootToImage}`;
    }

    node.children = [];

    const imageOutputPath = path.resolve(config.outputPath, pathFromRootToImage);
    generateDiagram(imageOutputPath, pumlContent);
  },
};
