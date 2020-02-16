const path = require('path');
const cheerio = require('cheerio');
const cryptoJS = require('crypto-js');
const fs = require('fs');
const { exec } = require('child_process');

const parserUtil = require('../lib/markbind/src/utils');
const logger = require('../util/logger');
const fsUtil = require('../util/fsUtil');
const md = require('../lib/markbind/src/lib/markdown-it');
const {
  ATTRIB_RESULT_PATH,
} = require('../lib/markbind/src/constants');

const _ = {};
_.hasIn = require('lodash/hasIn');

const PLANTUML_JAR_NAME = 'plantuml.jar';
const PUML_NAME = 'puml';

function getFileName(context, content) {
  if (context.name !== undefined) {
    return `${context.name}.png`;
  }

  if (context.src !== undefined) {
    const fileName = fsUtil.removeExtension(context.src);
    return `${fileName}.png`;
  }

  const hashedContent = cryptoJS.MD5(content).toString();
  return `${hashedContent}.png`;
}

function generateElement(context) {
  const element = cheerio.parseHTML('<pic></pic>')[0];
  const entries = Object.entries(context);
  entries.forEach(([key, val]) => {
    if (key === ATTRIB_RESULT_PATH) {
      return;
    }
    element.attribs[key] = val;
  });

  return element;
}

/*
* Curry function takes in context returning a widgetHandler function
* PUML widgetHandler takes in raw PUML contents and returns img with puml
*/
function parseAndRender(context) {
  return function (content) {
    const outputDir = path.dirname(context.resultPath);
    const fileName = getFileName(context, content);
    // Path of the .puml file
    const outputPath = path.join(outputDir, path.basename(fileName));
    const JAR_PATH = path.resolve(__dirname, PLANTUML_JAR_NAME);

    // Creates output dir if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Java command to launch PlantUML jar
    const cmd = `java -jar "${JAR_PATH}" -pipe > "${outputPath}"`;
    const childProcess = exec(cmd);

    let errorLog = '';
    childProcess.stdin.write(
      content,
      (e) => {
        if (e) {
          logger.debug(e);
        }
        childProcess.stdin.end();
      },
    );

    childProcess.on('error', (error) => {
      logger.debug(error);
    });

    childProcess.stderr.on('data', (errorMsg) => {
      errorLog += errorMsg;
    });

    childProcess.on('exit', () => {
      // This goes to the log file, but not shown on the console
      logger.debug(errorLog);
    });

    const elementContext = context;
    elementContext.src = fileName;
    const element = generateElement(elementContext);

    return cheerio.html(element);
  };
}

class Puml {
  constructor() {
    this.name = PUML_NAME;
  }

  preprocess(config, context, pumlElement) { // eslint-disable-line class-methods-use-this
    const element = pumlElement;
    if (!_.hasIn(element.attribs, 'src')) {
      return element;
    }
    const resultPath = path.resolve(path.dirname(config.resultPath), element.attribs.src);
    const pumlContext = {
      resultPath,
      ...element.attribs,
    };

    // Path of the .puml file
    const rawDiagramPath = path.resolve(path.dirname(context.cwf), pumlContext.src);
    const pumlContent = fs.readFileSync(rawDiagramPath, 'utf8');
    const generatePUML = parseAndRender(pumlContext);

    const childrenDOM = generatePUML(pumlContent);
    element.name = 'div';
    element.attribs = {};

    element.children = cheerio.parseHTML(childrenDOM);
    element.children.cwf = context.cwf;
    return element;
  }

  parse(config, context, pumlElement) {
    const element = pumlElement;

    const pumlContext = {
      resultPath: config.resultPath,
      ...element.attribs,
    };

    element.name = 'div';
    element.attribs = {};
    cheerio.prototype.options.xmlMode = false;
    const generatePUML = parseAndRender(pumlContext);
    const widgetHandler = {};
    widgetHandler[this.name] = generatePUML;

    const pumlContent = parserUtil.extractCodeElement(element, this.name);

    element.children = cheerio.parseHTML(md.render(cheerio.html(pumlContent), widgetHandler), true);
    return element;
  }
}

/*
* Parse and render PUML widget
*/
module.exports = {
  parseAndRender,
  Puml,
};
