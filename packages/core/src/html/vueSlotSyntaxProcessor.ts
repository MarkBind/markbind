import cheerio from 'cheerio';
import has from 'lodash/has';
import find from 'lodash/find';
import { DomElement } from 'htmlparser2';

const _ = {
  has,
  find,
};

export function getVslotShorthandName(node: DomElement) {
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
export function shiftSlotNodeDeeper(node: DomElement) {
  const nodeChildren = node.children ?? [];

  nodeChildren.forEach((child) => {
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName && child.name !== 'template') {
      const newSlotNode = cheerio.parseHTML('<template></template>')[0] as unknown as DomElement;

      const vslotShorthand = `#${vslotShorthandName}`;

      newSlotNode.attribs = newSlotNode?.attribs ?? {};
      newSlotNode.attribs[vslotShorthand] = '';
      if (child.attribs) {
        delete child.attribs[vslotShorthand];
      }

      newSlotNode.parent = node;
      child.parent = newSlotNode;

      newSlotNode.children = newSlotNode?.children ?? [];
      newSlotNode.children.push(child);

      // replace the shifted old child node with the new slot node
      nodeChildren.forEach((childNode, idx) => {
        if (childNode === child) {
          nodeChildren[idx] = newSlotNode;
        }
      });
    }
  });

  node.children = nodeChildren;
}

/*
 * Transforms deprecated vue slot syntax (slot="test") into the updated Vue slot shorthand syntax (#test).
 */
export function transformOldSlotSyntax(node: DomElement) {
  if (!node.children) {
    return;
  }

  node.children.forEach((child) => {
    if (child.attribs && _.has(child.attribs, 'slot')) {
      const vslotShorthandName = `#${child.attribs.slot}`;
      child.attribs[vslotShorthandName] = '';
      delete child.attribs.slot;
    }
  });
}

export function renameSlot(node: DomElement, originalName: string, newName: string) {
  if (!node.children) {
    return;
  }

  node.children.forEach((child) => {
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName && vslotShorthandName === originalName) {
      const newVslot = `#${newName}`;

      if (child.attribs) {
        child.attribs[newVslot] = '';
        delete child.attribs[`#${vslotShorthandName}`];
      }
    }
  });
}
