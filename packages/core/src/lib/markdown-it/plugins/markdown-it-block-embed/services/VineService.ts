// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import VideoServiceBase, { VideoServiceOptions } from './VideoServiceBase';

export interface VineOptions extends VideoServiceOptions {
  width?: number;
  height?: number;
  /**
   * The type of vine embed (e.g., 'simple').
   */
  embed?: string;
}

class VineService extends VideoServiceBase {

  getDefaultOptions(): VineOptions {
    return { width: 600, height: 600, embed: "simple" };
  }

  extractVideoID(reference: string): string {
    let match = reference.match(/^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/);
    return match && match[1].length === 11 ? match[1] : reference;
  }

  getVideoUrl(videoID: string): string {
    let escapedVideoID = this.env.md.utils.escapeHtml(videoID);
    let escapedEmbed = this.env.md.utils.escapeHtml(this.options.embed);
    return `//vine.co/v/${escapedVideoID}/embed/${escapedEmbed}`;
  }

}


module.exports = VineService;
