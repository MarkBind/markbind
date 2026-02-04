// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import PluginEnvironment from '../PluginEnvironment';

export interface VideoServiceOptions {
  width?: number;
  height?: number;
  ignoreStyle?: boolean;
  [key: string]: any;
}

export type UrlFilterDelegate = (
  url: string,
  serviceName: string,
  videoID: string,
  options: any
) => string;

const defaultUrlFilter: UrlFilterDelegate = (url) => url;

abstract class VideoServiceBase {
  public name: string;
  public options: VideoServiceOptions;
  public env: PluginEnvironment;

  constructor(name: string, options: VideoServiceOptions, env: PluginEnvironment) {
    this.name = name;
    this.options = Object.assign(this.getDefaultOptions(), options);
    this.env = env;
  }

  public getDefaultOptions(): VideoServiceOptions {
    return {};
  }
  
  /**
   * Overridden by child classes to extract the ID from a URL/reference.
   */
  public extractVideoID(reference: string): string | null {
    return reference;
  }

  /**
   * Overridden by child classes to provide the specific embed URL.
   */
  public abstract getVideoUrl(videoID: string): string;

  public getFilteredVideoUrl(videoID: string): string {
    let filterUrlDelegate: UrlFilterDelegate = typeof this.env.options.filterUrl === 'function'
        ? (this.env.options.filterUrl as UrlFilterDelegate)
        : defaultUrlFilter;
    let videoUrl = this.getVideoUrl(videoID);
    return filterUrlDelegate(videoUrl, this.name, videoID, this.env.options);
  }

  public getEmbedCode(videoID: string): string {
    let containerClassNames: string[] = [];
    if (this.env.options.containerClassName && this.options.ignoreStyle !== true) {
      containerClassNames.push(this.env.options.containerClassName);
    }

    let escapedServiceName = this.env.md.utils.escapeHtml(this.name);
    containerClassNames.push(this.env.options.serviceClassPrefix + escapedServiceName);

    const containerStyles: string[] = [];
    if (this.options.ignoreStyle !== true) {
      containerStyles.push('position: relative;');
      if (this.options.height !== undefined && this.options.width !== undefined) {
        containerStyles.push(`padding-bottom: ${this.options.height / this.options.width * 100}%`);
      }
    }

    let iframeAttributeList = [];
    iframeAttributeList.push([ "type", "text/html" ]);
    iframeAttributeList.push([ "src", this.getFilteredVideoUrl(videoID) ]);
    iframeAttributeList.push([ "frameborder", 0 ]);

    if (this.env.options.outputPlayerSize === true && this.options.ignoreStyle === true) {
      if (this.options.width !== undefined && this.options.width !== null) {
        iframeAttributeList.push([ "width", this.options.width ]);
      }
      if (this.options.height !== undefined && this.options.height !== null) {
        iframeAttributeList.push([ "height", this.options.height ]);
      }
    }

    if (this.env.options.allowFullScreen === true) {
      iframeAttributeList.push([ "webkitallowfullscreen" ]);
      iframeAttributeList.push([ "mozallowfullscreen" ]);
      iframeAttributeList.push([ "allowfullscreen" ]);
    }

    let iframeAttributes = iframeAttributeList
      .map(([key, value]) => (value !== undefined ? `${key}="${value}"` : key))
      .join(" ");

    return `<div class="${containerClassNames.join(" ")}" style="${containerStyles.join(" ")}">`
           + `<iframe ${iframeAttributes}></iframe>`
           + `</div>\n`;
  }

}

export default VideoServiceBase;

// function defaultUrlFilter(url, _videoID, _serviceName, _options) {
//   return url;
// }


// class VideoServiceBase {

//   constructor(name, options, env) {
//     this.name = name;
//     this.options = Object.assign(this.getDefaultOptions(), options);
//     this.env = env;
//   }

//   getDefaultOptions() {
//     return {};
//   }

//   extractVideoID(reference) {
//     return reference;
//   }

//   getVideoUrl(_videoID) {
//     throw new Error("not implemented");
//   }

//   getFilteredVideoUrl(videoID) {
//     let filterUrlDelegate = typeof this.env.options.filterUrl === "function"
//         ? this.env.options.filterUrl
//         : defaultUrlFilter;
//     let videoUrl = this.getVideoUrl(videoID);
//     return filterUrlDelegate(videoUrl, this.name, videoID, this.env.options);
//   }

//   getEmbedCode(videoID) {
//     let containerClassNames = [];
//     if (this.env.options.containerClassName && this.options.ignoreStyle !== true) {
//       containerClassNames.push(this.env.options.containerClassName);
//     }

//     let escapedServiceName = this.env.md.utils.escapeHtml(this.name);
//     containerClassNames.push(this.env.options.serviceClassPrefix + escapedServiceName);

//     let containerStyles = [];
//     if (this.options.ignoreStyle !== true) {
//       containerStyles.push(["position: relative;"]);
//       if (this.options.height !== undefined && this.options.width !== undefined) {
//         containerStyles.push(`padding-bottom: ${this.options.height / this.options.width * 100}%`);
//       }
//     }

//     let iframeAttributeList = [];
//     iframeAttributeList.push([ "type", "text/html" ]);
//     iframeAttributeList.push([ "src", this.getFilteredVideoUrl(videoID) ]);
//     iframeAttributeList.push([ "frameborder", 0 ]);

//     if (this.env.options.outputPlayerSize === true && this.options.ignoreStyle === true) {
//       if (this.options.width !== undefined && this.options.width !== null) {
//         iframeAttributeList.push([ "width", this.options.width ]);
//       }
//       if (this.options.height !== undefined && this.options.height !== null) {
//         iframeAttributeList.push([ "height", this.options.height ]);
//       }
//     }

//     if (this.env.options.allowFullScreen === true) {
//       iframeAttributeList.push([ "webkitallowfullscreen" ]);
//       iframeAttributeList.push([ "mozallowfullscreen" ]);
//       iframeAttributeList.push([ "allowfullscreen" ]);
//     }

//     let iframeAttributes = iframeAttributeList
//       .map(pair =>
//         pair[1] !== undefined
//             ? `${pair[0]}="${pair[1]}"`
//             : pair[0]
//       )
//       .join(" ");

//     return `<div class="${containerClassNames.join(" ")}" style="${containerStyles.join(" ")}">`
//            + `<iframe ${iframeAttributes}></iframe>`
//          + `</div>\n`;
//   }

// }


// module.exports = VideoServiceBase;
