var _ = {};
_.clone = require('lodash/clone');
var PageSources = /** @class */ (function () {
    function PageSources() {
        this.dynamicIncludeSrc = [];
        this.staticIncludeSrc = [];
        this.missingIncludeSrc = [];
    }
    PageSources.prototype.getDynamicIncludeSrc = function () {
        return _.clone(this.dynamicIncludeSrc);
    };
    PageSources.prototype.addAllToSet = function (set) {
        this.dynamicIncludeSrc.forEach(function (dependency) { return set.add(dependency.to); });
        this.staticIncludeSrc.forEach(function (dependency) { return set.add(dependency.to); });
        this.missingIncludeSrc.forEach(function (dependency) { return set.add(dependency.to); });
    };
    return PageSources;
}());
module.exports = {
    PageSources: PageSources,
};
