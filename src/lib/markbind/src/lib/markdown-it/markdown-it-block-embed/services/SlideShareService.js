"use strict";

const VideoServiceBase = require("./VideoServiceBase");

class SlideShareService extends VideoServiceBase {

  getDefaultOptions() {
    return {width: 599, height: 487};
  }

  extractVideoID(reference) {
    return reference;
  }

  getVideoUrl(videoID) {
    let escapedVideoID = this.env.md.utils.escapeHtml(videoID);
    return `//www.slideshare.net/slideshow/embed_code/key/${escapedVideoID}`;
  }
}

module.exports = SlideShareService;
