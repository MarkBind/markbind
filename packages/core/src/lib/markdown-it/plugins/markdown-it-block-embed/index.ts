// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import MarkdownIt from 'markdown-it';

import PluginEnvironment from './PluginEnvironment';
const renderer = require("./renderer");
import { createTokenizer } from './tokenizer';

export interface BlockEmbedOptions {
  containerClassName?: string;
  serviceClassPrefix?: string;
  outputPlayerSize?: boolean;
  allowFullScreen?: boolean;
  filterUrl?: ((url: string) => string) | null;
  services?: Record<string, any>;
  [serviceConfig: string]: any;
}

export default function setup(md: MarkdownIt, options: BlockEmbedOptions) {
  let env = new PluginEnvironment(md, options);

  md.block.ruler.before("fence", "video", createTokenizer(env.services), {
    alt: [ "paragraph", "reference", "blockquote", "list" ]
  });
  md.renderer.rules["video"] = renderer.bind(env);
}
