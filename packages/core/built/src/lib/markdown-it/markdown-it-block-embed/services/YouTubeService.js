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
var YouTubeService = /** @class */ (function (_super) {
    __extends(YouTubeService, _super);
    function YouTubeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YouTubeService.prototype.getDefaultOptions = function () {
        return { width: 640, height: 390 };
    };
    YouTubeService.prototype.extractVideoID = function (reference) {
        var match = reference.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&\?]*).*/);
        return match && match[7].length === 11 ? match[7] : reference;
    };
    YouTubeService.prototype.getVideoUrl = function (videoID) {
        var escapedVideoID = this.env.md.utils.escapeHtml(videoID);
        return "//www.youtube.com/embed/" + escapedVideoID;
    };
    return YouTubeService;
}(VideoServiceBase));
module.exports = YouTubeService;
