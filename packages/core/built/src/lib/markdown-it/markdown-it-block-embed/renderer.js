// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
"use strict";
function renderer(tokens, idx, options, _env) {
    var videoToken = tokens[idx];
    var service = videoToken.info.service;
    var videoID = videoToken.info.videoID;
    return service.getEmbedCode(videoID);
}
module.exports = renderer;
