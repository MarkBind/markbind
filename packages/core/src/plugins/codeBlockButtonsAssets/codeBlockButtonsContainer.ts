import cheerio from 'cheerio';
import { MbNode } from '../../utils/node';

export const CONTAINER_HTML = '<div class="function-btn-container"></div>';

export function isFunctionBtnContainer(node: MbNode) {
  return cheerio(node).hasClass('function-btn-container');
}

export function doesFunctionBtnContainerExistInNode(node: MbNode) {
  return cheerio(node)
    .children()
    .is((_, element) => isFunctionBtnContainer(element as MbNode));
}
