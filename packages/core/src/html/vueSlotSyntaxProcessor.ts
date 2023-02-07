const cheerio = require('cheerio');

const _ = {};
_.has = require('lodash/has');
_.find = require('lodash/find');

function getVslotShorthandName(node) {
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
function shiftSlotNodeDeeper(node) {
  if (!node.children) {
    return;
  }

  node.children.forEach((child) => {
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName && child.name !== 'template') {
      const newSlotNode = cheerio.parseHTML('<template></template>')[0];

      const vslotShorthand = `#${vslotShorthandName}`;
      newSlotNode.attribs[vslotShorthand] = '';
      delete child.attribs[vslotShorthand];

      newSlotNode.parent = node;
      child.parent = newSlotNode;

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
function transformOldSlotSyntax(node) {
  if (!node.children) {
    return;
  }

  node.children.forEach((child) => {
    if (_.has(child.attribs, 'slot')) {
      const vslotShorthandName = `#${child.attribs.slot}`;
      child.attribs[vslotShorthandName] = '';
      delete child.attribs.slot;
    }
  });
}

function renameSlot(node, originalName, newName) {
  if (node.children) {
    node.children.forEach((child) => {
      const vslotShorthandName = getVslotShorthandName(child);
      if (vslotShorthandName && vslotShorthandName === originalName) {
        const newVslot = `#${newName}`;
        child.attribs[newVslot] = '';
        delete child.attribs[`#${vslotShorthandName}`];
      }
    });
  }
}

module.exports = {
  getVslotShorthandName,
  shiftSlotNodeDeeper,
  transformOldSlotSyntax,
  renameSlot,
};
