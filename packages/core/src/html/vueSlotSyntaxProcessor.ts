import has from 'lodash/has';
import find from 'lodash/find';
import { MbNode, NodeOrText, parseHTML } from '../utils/node';

const _ = {
  has,
  find,
};

export function getVslotShorthandName(node: NodeOrText) {
  if (!node.attribs) {
    return '';
  }

  const keys = Object.keys(node.attribs);
  const vslotShorthand = _.find(keys, key => key.startsWith('#'));
  if (!vslotShorthand) {
    return '';
  }

  return vslotShorthand.substring(1, vslotShorthand.length); // remove #
}

/*
 * Shifts the slot node deeper by one level by creating a new intermediary node with template tag name.
 */
export function shiftSlotNodeDeeper(node: MbNode) {
  node.children.forEach((child) => {
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName && child.name !== 'template') {
      const newSlotNode = parseHTML('<template></template>')[0] as MbNode;

      const vslotShorthand = `#${vslotShorthandName}`;

      newSlotNode.attribs[vslotShorthand] = '';
      if (child.attribs) {
        delete child.attribs[vslotShorthand];
      }

      newSlotNode.parent = node;
      child.parent = newSlotNode;

      newSlotNode.children = newSlotNode.children ?? [];
      newSlotNode.children.push(child);

      // replace the shifted old child node with the new slot node
      node.children.forEach((childNode, idx) => {
        if (childNode === child) {
          node.children[idx] = newSlotNode;
        }
      });
    }
  });
}

/*
 * Transforms deprecated vue slot syntax (slot="test") into the updated Vue slot shorthand syntax (#test).
 */
export function transformOldSlotSyntax(node: MbNode) {
  node.children.forEach((child) => {
    if (child.attribs && _.has(child.attribs, 'slot')) {
      const vslotShorthandName = `#${child.attribs.slot}`;
      child.attribs[vslotShorthandName] = '';
      delete child.attribs.slot;
    }
  });
}
