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
    if (!this.intralinkCollection.has(resourcePath)) {
      this.intralinkCollection.set(resourcePath, new Set());
    }
    this.intralinkCollection.get(resourcePath).add(cwf);
  }

  validateAllIntralinks() {
    if (!this.config.intrasiteLinkValidation.enabled) {
      return;
    }

    this.intralinkCollection.forEach((cwfSet, resourcePath) => {
      cwfSet.forEach(cwf => linkProcessor.validateIntraLink(resourcePath, cwf, this.config));
    });
  }

  /**
   * Add an link to the intralinkCollection to be validated later,
   * if the node should be validated and intralink validation is not disabled.
   */
  collectIntraLink(node, cwf) {
    if (!tagsToValidate.has(node.name)) {
      return;
    }

    if (node.attribs) {
      const hasIntralinkValidationDisabled = _.has(node.attribs, 'no-validation');
      if (hasIntralinkValidationDisabled) {
        return;
      }
    }

    const resourcePath = linkProcessor.getDefaultTagsResourcePath(node);
    this._addToCollection(resourcePath, cwf);
  }
}

module.exports = {
  SiteLinkManager,
};
