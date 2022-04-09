"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions() {
    return {};
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(serviceUrl) {
    return `${serviceUrl}`;
  }
}

module.exports = PowerPointOnlineService;
