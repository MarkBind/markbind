// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
"use strict";
var PluginEnvironment = require("./PluginEnvironment");
var renderer = require("./renderer");
var tokenizer = require("./tokenizer");
function setup(md, options) {
    var env = new PluginEnvironment(md, options);
    md.block.ruler.before("fence", "video", tokenizer.bind(env), {
        alt: ["paragraph", "reference", "blockquote", "list"]
    });
    md.renderer.rules["video"] = renderer.bind(env);
}
module.exports = setup;
