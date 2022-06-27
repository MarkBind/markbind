"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions() {
    return { width: 610, height: 481 };
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(serviceUrl) {
    return `${serviceUrl}`;
  }
}

module.exports = PowerPointOnlineService;
