const path = require('path');
const fs = require('fs-extra');

const Vue = require('vue');
// Vue.config.silent = true;
const VueCompiler = require('vue-template-compiler');
const { renderToString } = require('vue-server-renderer').createRenderer();

const domino = require('domino');

global.window = domino.createWindow('<h1>Hello world</h1>');
global.document = global.window.document;

let bundle;

/**
 * Compiles page into Vue Application to get the page render function and places
 * it into a script so that the browser can retrieve the page render function to
 * render the page during Vue mounting.
 *
 * This is to avoid the overhead of compiling the page into Vue application
 * on the client's browser (alleviates FOUC).
 *
 * @param content Page content to be compiled into Vue app
 */
async function compileVuePageAndCreateScript(content, pageConfig, pageAsset) {
  // Compile Vue Page
  const compiled = VueCompiler.compileToFunctions(`<div id="app">${content}</div>`);

  const outputContent = `
    var pageVueRenderFn = ${compiled.render};
    var pageVueStaticRenderFns = [${compiled.staticRenderFns}];
  `;

  // Get script file name
  const pageHtmlFileName = path.basename(pageConfig.resultPath, '.html');
  const scriptFileName = `${pageHtmlFileName}.page-vue-render.js`;

  /*
    * Add the script file path for this page's render function to the page's assets (to populate page.njk).
    * The script file path is the same as the page's file path.
    */
  pageAsset.pageVueRenderJs = scriptFileName;

  // Get script's absolute file path to output script file
  const dirName = path.dirname(pageConfig.resultPath);
  const filePath = path.join(dirName, scriptFileName);

  await fs.outputFile(filePath, outputContent);
}

// got from stackOverflow
function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths; // without this, won't be able to require vue in the string module
  m._compile(src, filename);
  return m.exports;
}

async function renderVuePage(content) {
  // const FreshVue = Vue.extend();

  const { MarkBindVue } = requireFromString(bundle, '');
  Vue.use(MarkBindVue);

  const VueAppPage = new Vue({
    // template: content,
    template: `<div id="app">${content}</div>`,
    // data: {
    //   searchData: [],
    //   popoverInnerGetters: {},
    //   tooltipInnerContentGetter: {},
    //   fragment: '',
    //   questions: [],
    // },
    // props: {
    //   threshold: Number(0.5),
    // },
    // methods: {
    //   searchCallback: () => {},
    // },
    // provide: {
    //   hasParentDropdown: true,
    //   questions: [],
    //   gotoNextQuestion: true,
    // },
  });

  const renderedContent = await renderToString(VueAppPage);

  return renderedContent;
}

async function updateBundleRenderer(newBundle) {
  bundle = newBundle;

  // pages.forEach(async (pageContentCopy) => {
  //   const { content, pageConfig, asset, pageNav, pluginManager, page } = pageContentCopy;
  //   await compileVuePageAndCreateScript(content, pageConfig, asset);
  //   const renderedContent = await renderVuePage(content);
  //   const renderedTemplate = pageConfig.template.render(
  //     page.prepareTemplateData(renderedContent, !!pageNav)); // page.njk

  //   const outputTemplateHTML = pageConfig.disableHtmlBeautify
  //     ? htmlBeautify(renderedTemplate, pluginManager.htmlBeautifyOptions)
  //     : renderedTemplate;

  //   await fs.outputFile(pageConfig.resultPath, outputTemplateHTML);
  // });

  console.log('UPDATED BUNDLE!');
}

const pageVueServerRenderer = {
  compileVuePageAndCreateScript,
  renderVuePage,
  updateBundleRenderer,
};

module.exports = {
  pageVueServerRenderer,
};
