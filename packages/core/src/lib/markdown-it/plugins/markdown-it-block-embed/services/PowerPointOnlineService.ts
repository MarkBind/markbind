"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions() {
    return { width: 610, height: 481, ignoreStyle: true };
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(serviceUrl) {
    return `${serviceUrl}&action=embedview&wdAr=1.3333333333333333`;
  }
}

module.exports = PowerPointOnlineService;
