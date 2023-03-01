import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';
import pick from 'lodash/pick';
import { Node } from '../utils/node';

const _ = { pick };

export function createErrorNode(element: DomElement, error: any) {
  const errorElement = cheerio.parseHTML(
    `<div style="color: red">${error.message}</div>`, undefined, true,
  )[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children'])) as Node;
}

export function createSlotTemplateNode(slotName: string, content: string): DomElement[] {
  return cheerio.parseHTML(
    `<template #${slotName}>${content}</template>`, undefined, true,
  ) as unknown as DomElement[];
}
