"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions() {
    return {customStyle: true};
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(serviceUrl) {
    return `${serviceUrl}`;
  }
}

module.exports = PowerPointOnlineService;
