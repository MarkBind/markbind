// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

import Token from 'markdown-it/lib/token';

export default function renderer(tokens: Token[], idx: number, _options: any, _env: any): string {
  let videoToken = tokens[idx];

  let service = (videoToken as any).info.service;
  let videoID = (videoToken as any).info.videoID;

  return service.getEmbedCode(videoID);
}
