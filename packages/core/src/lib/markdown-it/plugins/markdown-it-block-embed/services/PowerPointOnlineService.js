"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions() {
    return { width: 500, height: 375 };
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(serviceUrl) {
    return `${serviceUrl}`;
  }
}

module.exports = PowerPointOnlineService;
