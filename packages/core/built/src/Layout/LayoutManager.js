var fs = require('fs-extra');
var path = require('path');
var Layout = require('./Layout').Layout;
var logger = require('../utils/logger');
var FRONT_MATTER_NONE_ATTR = require('../Page/constants').FRONT_MATTER_NONE_ATTR;
var LayoutManager = /** @class */ (function () {
    function LayoutManager(config) {
        this.config = config;
        this.layoutsRootPath = path.join(config.rootPath, '_markbind', 'layouts');
        this.layouts = {};
    }
    /**
     * Flag all layouts for (re)generation when requested
     */
    LayoutManager.prototype.removeLayouts = function () {
        this.layouts = {};
    };
    /**
     * Update layouts which have the provided filePaths as dependencies
     */
    LayoutManager.prototype.updateLayouts = function (filePaths) {
        var _this = this;
        var layoutsToRegenerate = Object.entries(this.layouts)
            .filter(function (_a) {
            var layout = _a[1];
            return layout.shouldRegenerate(filePaths);
        });
        return Promise.all(layoutsToRegenerate.map(function (_a) {
            var name = _a[0], layout = _a[1];
            _this.layouts[name] = new Layout(layout.sourceFilePath, _this.config);
            return _this.layouts[name].generate();
        }));
    };
    LayoutManager.prototype.generateLayoutIfNeeded = function (name) {
        if (this.layouts[name]) {
            return this.layouts[name].generatePromise;
        }
        var layoutPath = path.join(this.layoutsRootPath, name);
        if (!fs.existsSync(layoutPath)) {
            logger.error("'" + name + "' layout does not exist");
            return Promise.resolve();
        }
        this.layouts[name] = new Layout(layoutPath, this.config);
        this.layouts[name].generatePromise = this.layouts[name].generate();
        return this.layouts[name].generatePromise;
    };
    LayoutManager.prototype.layoutHasPageNav = function (name) {
        if (name === FRONT_MATTER_NONE_ATTR) {
            return false;
        }
        return this.layouts[name] && this.layouts[name].hasPageNav;
    };
    LayoutManager.prototype.combineLayoutWithPage = function (name, pageContent, pageNav, pageIncludedFiles) {
        if (name === FRONT_MATTER_NONE_ATTR) {
            return pageContent;
        }
        if (!this.layouts[name]) {
            return pageContent;
        }
        return this.layouts[name].insertPage(pageContent, pageNav, pageIncludedFiles);
    };
    LayoutManager.prototype.getLayoutPageNjkAssets = function (name) {
        if (name === FRONT_MATTER_NONE_ATTR || !this.layouts[name]) {
            return {};
        }
        return this.layouts[name].getPageNjkAssets();
    };
    return LayoutManager;
}());
module.exports = {
    LayoutManager: LayoutManager,
};
