// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import VideoServiceBase, { VideoServiceOptions } from "./VideoServiceBase";

export interface YouTubeOptions extends VideoServiceOptions {
  width?: number;
  height?: number;
  [key: string]: any;
}

export default class YouTubeService extends VideoServiceBase {

  getDefaultOptions(): YouTubeOptions {
    return { width: 640, height: 390 };
  }

  extractVideoID(reference: string): string {
    let match = reference.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&\?]*).*/);
    return match && match[7].length === 11 ? match[7] : reference;
  }

  getVideoUrl(videoID: string): string {
    let escapedVideoID = this.env.md.utils.escapeHtml(videoID);
    return `//www.youtube.com/embed/${escapedVideoID}`;
  }

}
