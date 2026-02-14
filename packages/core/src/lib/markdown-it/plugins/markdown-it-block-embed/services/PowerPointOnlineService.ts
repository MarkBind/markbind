import VideoServiceBase, { VideoServiceOptions } from './VideoServiceBase';

export interface PowerPointOnlineOptions extends VideoServiceOptions {
  width?: number;
  height?: number;
}

export default class PowerPointOnlineService extends VideoServiceBase {

  getDefaultOptions(): PowerPointOnlineOptions {
    return { width: 610, height: 481, ignoreStyle: true };
  }

  extractVideoID(reference: string): string {
    return reference;
  }

  getVideoUrl(serviceUrl: string): string {
    return `${serviceUrl}&action=embedview&wdAr=1.3333333333333333`;
  }
}
