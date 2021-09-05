const CONTAINER_HTML = `<div class="function-btn-container"></div>`;

function isFunctionBtnContainer(node) {
  return node
    .attribs
    ?.class
    ?.split(' ')
    .includes('function-btn-container');
}

function doesFunctionBtnContainerExistInNode(node) {
  return node
    .children
    ?.some(child => isFunctionBtnContainer(child));
}

module.exports = {
  CONTAINER_HTML,
  isFunctionBtnContainer,
  doesFunctionBtnContainerExistInNode
};
