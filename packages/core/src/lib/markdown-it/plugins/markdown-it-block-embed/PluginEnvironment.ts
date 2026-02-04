// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import MarkdownIt from 'markdown-it';
import { EmbedServiceMap } from './tokenizer';
import { BlockEmbedOptions } from './index';

import { YouTubeService } from './services/YouTubeService';
const VimeoService = require('./services/VimeoService');
const VineService = require('./services/VineService');
const PreziService = require('./services/PreziService');
const SlideShareService = require('./services/SlideShareService');
const PowerPointOnlineService = require('./services/PowerPointOnlineService');

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
      services[serviceName] = new _serviceClass(serviceName, this.options[serviceName], this);
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
