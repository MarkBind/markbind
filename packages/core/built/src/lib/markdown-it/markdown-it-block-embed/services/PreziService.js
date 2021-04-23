// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
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
var PreziService = /** @class */ (function (_super) {
    __extends(PreziService, _super);
    function PreziService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreziService.prototype.getDefaultOptions = function () {
        return { width: 550, height: 400 };
    };
    PreziService.prototype.extractVideoID = function (reference) {
        var match = reference.match(/^https:\/\/prezi.com\/(.[^/]+)/);
        return match ? match[1] : reference;
    };
    PreziService.prototype.getVideoUrl = function (videoID) {
        var escapedVideoID = this.env.md.utils.escapeHtml(videoID);
        return "https://prezi.com/embed/" + escapedVideoID
            + "/?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=0&amp;autohide_ctrls=0&amp;"
            + "landing_data=bHVZZmNaNDBIWnNjdEVENDRhZDFNZGNIUE43MHdLNWpsdFJLb2ZHanI5N1lQVHkxSHFxazZ0UUNCRHloSXZROHh3PT0&amp;"
            + "landing_sign=1kD6c0N6aYpMUS0wxnQjxzSqZlEB8qNFdxtdjYhwSuI";
    };
    return PreziService;
}(VideoServiceBase));
module.exports = PreziService;
