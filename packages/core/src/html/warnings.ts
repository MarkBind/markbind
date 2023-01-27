const logger = require('../utils/logger');
const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

/**
 * Check and warns if element has conflicting attributes.
 * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
 * but only towards `attribute`
 * @param node Root element to check
 * @param attribute An attribute that is conflicting with other attributes
 * @param attrsConflictingWith The attributes conflicting with `attribute`
 */
function _warnConflictingAttributes(node, attribute, attrsConflictingWith) {
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

/**
 * Check and warns if element has a deprecated slot name
 * @param element Root element to check
 * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
 */
function _warnDeprecatedSlotNames(element, namePairs) {
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

const warnConflictingAtributesMap = {
  box: (node) => {
    _warnConflictingAttributes(node, 'light', ['seamless']);
    _warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    _warnConflictingAttributes(node, 'no-border',
                               ['border-color', 'border-left-color', 'seamless']);
    _warnConflictingAttributes(node, 'no-icon', ['icon']);
  },
};

const warnDeprecatedAtributesMap = {
  modal: (node) => {
    _warnDeprecatedSlotNames(node, {
      'modal-header': 'header',
      'modal-footer': 'footer',
    });
  },
};

module.exports = {
  warnConflictingAtributesMap,
  warnDeprecatedAtributesMap,
};
