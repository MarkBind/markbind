const logger = require('../utils/logger');
const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const { ATTRIB_CWF } = require('../constants');

/**
 * Check and warns if element has conflicting attributes.
 * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
 * but only towards `attribute`
 * @param node Root element to check
 * @param attribute An attribute that is conflicting with other attributes
 * @param attrsConflictingWith The attributes conflicting with `attribute`
 */
function warnConflictingAttributes(node, attribute, attrsConflictingWith) {
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
 * Check and warns if element has a deprecated attribute.
 * @param node Root element to check
 * @param attributeNamePairs Object of attribute name pairs with each pair in the form deprecated : correct
 */
function warnDeprecatedAttributes(node, attributeNamePairs) {
  Object.entries(attributeNamePairs)
    .forEach(([deprecatedAttrib, correctAttrib]) => {
      if (deprecatedAttrib in node.attribs) {
        logger.warn(`${node.name} attribute '${deprecatedAttrib}' `
            + `is deprecated and may be removed in the future. Please use '${correctAttrib}'`);
      }
    });
}

/**
 * Check and warns if element has a deprecated slot name
 * @param element Root element to check
 * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
 */
function warnDeprecatedSlotNames(element, namePairs) {
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

/*
 * Body
 */

function preprocessBody(node) {
  // eslint-disable-next-line no-console
  console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
}

module.exports = {
  warnConflictingAttributes,
  warnDeprecatedAttributes,
  warnDeprecatedSlotNames,
  preprocessBody,
};
