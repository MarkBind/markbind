import * as logger from '../utils/logger';
import { MbNode } from '../utils/node';
import { getVslotShorthandName } from './vueSlotSyntaxProcessor';

/**
 * Check and warns if element has conflicting attributes.
 * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
 * but only towards `attribute`
 * @param node Root element to check
 * @param attribute An attribute that is conflicting with other attributes
 * @param attrsConflictingWith The attributes conflicting with `attribute`
 */
function _warnConflictingAttributes(node: MbNode, attribute: string, attrsConflictingWith: string[]) {
  if (!node.attribs || !(attribute in node.attribs)) {
    return;
  }

  const nodeAttribs = node.attribs;
  attrsConflictingWith.forEach((conflictingAttr) => {
    if (conflictingAttr in nodeAttribs) {
      logger.warn(`Usage of conflicting ${node.name} attributes: `
          + `'${attribute}' with '${conflictingAttr}'`);
    }
  });
}

/**
 * Check and warns if element has a deprecated slot name
 * @param element Root element to check
 * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
 */
function _warnDeprecatedSlotNames(element: MbNode, namePairs: { [name: string]: string }) {
  if (!(element.children)) {
    return;
  }
  element.children.forEach((child) => {
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName) {
      Object.entries(namePairs)
        .forEach(([deprecatedName, correctName]) => {
          if (vslotShorthandName !== deprecatedName) {
            return;
          }
          logger.warn(`${element.name} shorthand slot name '${deprecatedName}' `
              + `is deprecated and may be removed in the future. Please use '${correctName}'`);
        });
    }
  });
}

export const warnConflictingAtributesMap: { [attr: string]: (nd: MbNode) => void } = {
  box: (node) => {
    _warnConflictingAttributes(node, 'light', ['seamless']);
    _warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    _warnConflictingAttributes(node, 'no-border',
                               ['border-color', 'border-left-color', 'seamless']);
    _warnConflictingAttributes(node, 'no-icon', ['icon']);
  },
};

export const warnDeprecatedAtributesMap: { [attr: string]: (nd: MbNode) => void } = {
  modal: (node) => {
    _warnDeprecatedSlotNames(node, {
      'modal-header': 'header',
      'modal-footer': 'footer',
    });
  },
};
