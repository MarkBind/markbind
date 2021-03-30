/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const config = require('./webpack.common.js');

module.exports = merge(config, {
  entry: {
    vueCommonAppFactory: path.join(__dirname, 'src', 'VueCommonAppFactory.js'),
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({
      // to "stub" global browser variables which are not present during server rendering
      'window': undefined,
      'document': undefined,
    }),
  ],
});
