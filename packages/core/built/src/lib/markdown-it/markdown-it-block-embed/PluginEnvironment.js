// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
'use strict';
var YouTubeService = require('./services/YouTubeService');
var VimeoService = require('./services/VimeoService');
var VineService = require('./services/VineService');
var PreziService = require('./services/PreziService');
var SlideShareService = require('./services/SlideShareService');
var PowerPointOnlineService = require('./services/PowerPointOnlineService');
var PluginEnvironment = /** @class */ (function () {
    function PluginEnvironment(md, options) {
        this.md = md;
        this.options = Object.assign(this.getDefaultOptions(), options);
        this._initServices();
    }
    PluginEnvironment.prototype._initServices = function () {
        var defaultServiceBindings = {
            'youtube': YouTubeService,
            'vimeo': VimeoService,
            'vine': VineService,
            'prezi': PreziService,
            'slideshare': SlideShareService,
            'powerpoint': PowerPointOnlineService,
        };
        var serviceBindings = Object.assign({}, defaultServiceBindings, this.options.services);
        var services = {};
        for (var _i = 0, _a = Object.keys(serviceBindings); _i < _a.length; _i++) {
            var serviceName = _a[_i];
            var _serviceClass = serviceBindings[serviceName];
            services[serviceName] = new _serviceClass(serviceName, this.options[serviceName], this);
        }
        this.services = services;
    };
    PluginEnvironment.prototype.getDefaultOptions = function () {
        return {
            containerClassName: 'block-embed',
            serviceClassPrefix: 'block-embed-service-',
            outputPlayerSize: true,
            allowFullScreen: true,
            filterUrl: null
        };
    };
    return PluginEnvironment;
}());
module.exports = PluginEnvironment;
