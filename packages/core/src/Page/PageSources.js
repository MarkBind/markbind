const _ = {};
_.clone = require('lodash/clone');

class PageSources {
  constructor() {
    this.dynamicIncludeSrc = [];
    this.staticIncludeSrc = [];
    this.missingIncludeSrc = [];
  }

  getDynamicIncludeSrc() {
    return _.clone(this.dynamicIncludeSrc);
  }

  getStaticIncludeSrc() {
    return _.clone(this.staticIncludeSrc);
  }

  getMissingIncludeSrc() {
    return _.clone(this.missingIncludeSrc);
  }
}

module.exports = {
  PageSources,
};
