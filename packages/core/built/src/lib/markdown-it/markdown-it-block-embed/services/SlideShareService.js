"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var VideoServiceBase = require("./VideoServiceBase");
var SlideShareService = /** @class */ (function (_super) {
    __extends(SlideShareService, _super);
    function SlideShareService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SlideShareService.prototype.getDefaultOptions = function () {
        return { width: 599, height: 487 };
    };
    SlideShareService.prototype.extractVideoID = function (reference) {
        return reference;
    };
    SlideShareService.prototype.getVideoUrl = function (videoID) {
        var escapedVideoID = this.env.md.utils.escapeHtml(videoID);
        return "//www.slideshare.net/slideshow/embed_code/key/" + escapedVideoID;
    };
    return SlideShareService;
}(VideoServiceBase));
module.exports = SlideShareService;
