// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import MarkdownIt from 'markdown-it';
import { EmbedServiceMap } from './tokenizer.js';
import { BlockEmbedOptions } from './index.js';

import YouTubeService from './services/YouTubeService.js';
import VimeoService from './services/VimeoService.js';
import { VineService } from './services/VineService.js';
import PreziService from './services/PreziService.js';
import SlideShareService from './services/SlideShareService.js';
import PowerPointOnlineService from './services/PowerPointOnlineService.js';

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
      youtube: YouTubeService,
      vimeo: VimeoService,
      vine: VineService,
      prezi: PreziService,
      slideshare: SlideShareService,
      powerpoint: PowerPointOnlineService,
    };

    const serviceBindings = { ...defaultServiceBindings, ...this.options.services };
    const services: EmbedServiceMap = {};
    for (const serviceName of Object.keys(serviceBindings)) {
      const _serviceClass = serviceBindings[serviceName];
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
      filterUrl: null,
    };
  }
}
