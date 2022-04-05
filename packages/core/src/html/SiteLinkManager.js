const linkProcessor = require('./linkProcessor');

const _ = {};
_.has = require('lodash/has');

const tagsToValidate = new Set([
  'img',
  'pic',
  'thumbnail',
  'a',
  'link',
  'script',
]);

class SiteLinkManager {
  constructor(config) {
    this.config = config;
    this.intralinkCollection = new Map();
  }

  /**
   * Adds a resourcePath and cwf to the intralinkCollection,
   * ensuring each pair of (resourcePath, cwf) appears only once
   */
  _addToCollection(resourcePath, cwf) {
    if (!this.intralinkCollection.has(cwf)) {
      this.intralinkCollection.set(cwf, new Set());
    }
    this.intralinkCollection.get(cwf).add(resourcePath);
  }

  validateAllIntralinks() {
    if (!this.config.intrasiteLinkValidation.enabled) {
      return;
    }

    this.intralinkCollection.forEach((resourcePaths, cwf) => {
      resourcePaths.forEach(resourcePath => linkProcessor.validateIntraLink(resourcePath, cwf, this.config));
    });

    this.intralinkCollection = new Map();
  }

  /**
   * Add a link to the intralinkCollection to be validated later,
   * if the node should be validated and intralink validation is not disabled.
   */
  collectIntraLinkToValidate(node, cwf) {
    if (!tagsToValidate.has(node.name)) {
      return 'Should not validate';
    }

    const mailtoOrTelRegex = /^(?:mailto:|tel:)/i;
    if (_.has(node.attribs, 'href') && mailtoOrTelRegex.test(node.attribs.href)) {
      return 'Should not validate mailto or tel links';
    }

    if (node.attribs) {
      const hasIntralinkValidationDisabled = _.has(node.attribs, 'no-validation');
      if (hasIntralinkValidationDisabled) {
        return 'Intralink validation disabled';
      }
    }

    const resourcePath = linkProcessor.getDefaultTagsResourcePath(node);
    this._addToCollection(resourcePath, cwf);
    return 'Intralink collected to be validated later';
  }
}

module.exports = {
  SiteLinkManager,
};
