// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import VideoServiceBase, { VideoServiceOptions } from './VideoServiceBase';

export interface PreziOptions extends VideoServiceOptions {
  width?: number;
  height?: number;
}


export default class PreziService extends VideoServiceBase {

  getDefaultOptions(): PreziOptions {
    return { width: 550, height: 400 };
  }

  extractVideoID(reference: string): string {
    let match = reference.match(/^https:\/\/prezi.com\/(.[^/]+)/);
    return match ? match[1] : reference;
  }

  getVideoUrl(videoID: string): string {
    let escapedVideoID = this.env.md.utils.escapeHtml(videoID);
    return "https://prezi.com/embed/" + escapedVideoID
        + "/?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=0&amp;autohide_ctrls=0&amp;"
        + "landing_data=bHVZZmNaNDBIWnNjdEVENDRhZDFNZGNIUE43MHdLNWpsdFJLb2ZHanI5N1lQVHkxSHFxazZ0UUNCRHloSXZROHh3PT0&amp;"
        + "landing_sign=1kD6c0N6aYpMUS0wxnQjxzSqZlEB8qNFdxtdjYhwSuI";
  }

}
