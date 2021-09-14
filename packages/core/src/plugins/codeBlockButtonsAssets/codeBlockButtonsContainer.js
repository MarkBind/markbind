const cheerio = module.parent.require('cheerio');
const CONTAINER_HTML = '<div class="function-btn-container"></div>';

function isFunctionBtnContainer(node) {
  return cheerio(node).hasClass('function-btn-container');
}

function doesFunctionBtnContainerExistInNode(node) {
  return cheerio(node)
    .children()
    .is((index, element) => isFunctionBtnContainer(element));
}

module.exports = {
  CONTAINER_HTML,
  isFunctionBtnContainer,
  doesFunctionBtnContainerExistInNode,
};
