// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import MarkdownIt from 'markdown-it';

import PluginEnvironment from './PluginEnvironment.js';
import renderer from './renderer.js';
import { createTokenizer } from './tokenizer.js';

export type UrlFilterDelegate = (
  url: string,
  serviceName: string,
  videoID: string,
  options: BlockEmbedOptions
) => string;

export interface BlockEmbedOptions {
  containerClassName?: string;
  serviceClassPrefix?: string;
  outputPlayerSize?: boolean;
  allowFullScreen?: boolean;
  filterUrl?: UrlFilterDelegate | null;
  services?: Record<string, any>;
  [serviceConfig: string]: any;
}

export function setup(md: MarkdownIt, options?: BlockEmbedOptions) {
  const normalizedOptions: BlockEmbedOptions = options ?? {};
  const env = new PluginEnvironment(md, normalizedOptions);

  md.block.ruler.before('fence', 'video', createTokenizer(env.services), {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
  md.renderer.rules.video = renderer.bind(env);
}
