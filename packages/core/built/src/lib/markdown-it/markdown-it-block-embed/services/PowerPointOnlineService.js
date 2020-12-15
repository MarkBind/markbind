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
var PowerPointOnlineService = /** @class */ (function (_super) {
    __extends(PowerPointOnlineService, _super);
    function PowerPointOnlineService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PowerPointOnlineService.prototype.getDefaultOptions = function () {
        return { width: 610, height: 481 };
    };
    PowerPointOnlineService.prototype.extractVideoID = function (reference) {
        return reference;
    };
    PowerPointOnlineService.prototype.getVideoUrl = function (serviceUrl) {
        return serviceUrl + "&action=embedview&wdAr=1.3333333333333333";
    };
    return PowerPointOnlineService;
}(VideoServiceBase));
module.exports = PowerPointOnlineService;
