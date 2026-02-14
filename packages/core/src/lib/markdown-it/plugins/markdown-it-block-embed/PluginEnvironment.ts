// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import MarkdownIt from 'markdown-it';
import { EmbedServiceMap } from './tokenizer';
import { BlockEmbedOptions } from './index';

import YouTubeService from './services/YouTubeService';
import VimeoService from './services/VimeoService';
import VineService from './services/VineService';
import PreziService from './services/PreziService';
import SlideShareService from './services/SlideShareService';
import PowerPointOnlineService from './services/PowerPointOnlineService';

export default class PluginEnvironment {
  public md: MarkdownIt;
  public options: BlockEmbedOptions;
  public services: EmbedServiceMap = {};

  constructor(md: MarkdownIt, options: BlockEmbedOptions) {
    this.md = md;
    this.options = Object.assign(this.getDefaultOptions(), options);

    this._initServices();
  }

  _initServices(): void {
    const defaultServiceBindings: Record<string, any> = {
      'youtube': YouTubeService,
      'vimeo': VimeoService,
      'vine': VineService,
      'prezi': PreziService,
      'slideshare': SlideShareService,
      'powerpoint': PowerPointOnlineService,
    };

    let serviceBindings = Object.assign({}, defaultServiceBindings, this.options.services);
    let services: EmbedServiceMap = {};
    for (let serviceName of Object.keys(serviceBindings)) {
      let _serviceClass = serviceBindings[serviceName];
      const ActualConstructor = _serviceClass.default || _serviceClass;

      if (typeof ActualConstructor === 'function') {
        services[serviceName] = new ActualConstructor(serviceName, this.options[serviceName], this);
      } else {
        console.error(`BlockEmbed Error: Service "${serviceName}" is not a valid constructor.`);
      }
    }

    this.services = services;
  }

  public getDefaultOptions(): BlockEmbedOptions {
    return {
      containerClassName: 'block-embed',
      serviceClassPrefix: 'block-embed-service-',
      outputPlayerSize: true,
      allowFullScreen: true,
      filterUrl: null
    };
  }

}
