import cheerio from 'cheerio';

export const CONTAINER_HTML = '<div class="function-btn-container"></div>';

export function isFunctionBtnContainer(node: cheerio.Element) {
  return cheerio(node).hasClass('function-btn-container');
}

export function doesFunctionBtnContainerExistInNode(node: cheerio.Element) {
  return cheerio(node)
    .children()
    .is((_, element) => isFunctionBtnContainer(element));
}
