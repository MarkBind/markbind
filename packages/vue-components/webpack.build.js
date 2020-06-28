const webpack = require('webpack');
const merge = require('webpack-merge');


const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const config = require('./webpack.common.js');

module.exports = merge(config, {
  mode: 'production',
  output: {
    filename: '[name].min.js',
  },
  plugins: [
    new TerserPlugin(),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
    }),
  ],
});
