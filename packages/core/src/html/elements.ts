import _ from 'lodash';
import { MbNode, NodeOrText, parseHTML } from '../utils/node.js';


export function createErrorNode(element: NodeOrText, error: any) {
  const errorElement = parseHTML(`<div style="color: red">${error.message}</div>`)[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children'])) as MbNode;
}

export function createSlotTemplateNode(slotName: string, content: string): MbNode[] {
  return parseHTML(`<template #${slotName}>${content}</template>`) as MbNode[];
}
