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
var VineService = /** @class */ (function (_super) {
    __extends(VineService, _super);
    function VineService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VineService.prototype.getDefaultOptions = function () {
        return { width: 600, height: 600, embed: "simple" };
    };
    VineService.prototype.extractVideoID = function (reference) {
        var match = reference.match(/^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/);
        return match && match[1].length === 11 ? match[1] : reference;
    };
    VineService.prototype.getVideoUrl = function (videoID) {
        var escapedVideoID = this.env.md.utils.escapeHtml(videoID);
        var escapedEmbed = this.env.md.utils.escapeHtml(this.options.embed);
        return "//vine.co/v/" + escapedVideoID + "/embed/" + escapedEmbed;
    };
    return VineService;
}(VideoServiceBase));
module.exports = VineService;
