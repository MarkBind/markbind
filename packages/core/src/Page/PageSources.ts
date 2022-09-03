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

  addAllToSet(set) {
    this.dynamicIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.staticIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.missingIncludeSrc.forEach(dependency => set.add(dependency.to));
  }
}

module.exports = {
  PageSources,
};
