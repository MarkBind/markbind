import * as logger from '../utils/logger';
import { MbNode } from '../utils/node';

/**
 * Check and warns if element has conflicting attributes.
 * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
 * but only towards `attribute`
 * @param node Root element to check
 * @param attribute An attribute that is conflicting with other attributes
 * @param attrsConflictingWith The attributes conflicting with `attribute`
 */
function _warnConflictingAttributes(node: MbNode, attribute: string, attrsConflictingWith: string[]) {
  if (!(attribute in node.attribs)) {
    return;
  }

  attrsConflictingWith.forEach((conflictingAttr) => {
    if (conflictingAttr in node.attribs) {
      logger.warn(`Usage of conflicting ${node.name} attributes: `
          + `'${attribute}' with '${conflictingAttr}'`);
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
