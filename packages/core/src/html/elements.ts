import cheerio from 'cheerio';
import pick from 'lodash/pick';
import { MbNode, NodeOrText } from '../utils/node';

const _ = { pick };

export function createErrorNode(element: NodeOrText, error: any) {
  const errorElement = cheerio.parseHTML(
    `<div style="color: red">${error.message}</div>`, undefined, true,
  )[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children'])) as MbNode;
}

export function createEmptyNode() {
  return cheerio.parseHTML('<div></div>', undefined, true)[0];
}

export function createSlotTemplateNode(slotName: string, content: string): MbNode[] {
  return cheerio.parseHTML(
    `<template #${slotName}>${content}</template>`, undefined, true,
  ) as unknown as MbNode[];
}
