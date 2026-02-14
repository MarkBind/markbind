import VideoServiceBase, { VideoServiceOptions } from './VideoServiceBase';

export interface SlideShareOptions extends VideoServiceOptions {
  width?: number;
  height?: number;
}

export default class SlideShareService extends VideoServiceBase {

  getDefaultOptions(): SlideShareOptions {
    return {width: 599, height: 487};
  }

  extractVideoID(reference: string): string {
    return reference;
  }

  getVideoUrl(videoID: string): string {
    let escapedVideoID = this.env.md.utils.escapeHtml(videoID);
    return `//www.slideshare.net/slideshow/embed_code/key/${escapedVideoID}`;
  }
}
