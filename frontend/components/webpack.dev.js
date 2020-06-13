const webpack = require('webpack');
const merge = require('webpack-merge');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const config = require('./webpack.common.js');


module.exports = merge(config, {
  mode: 'development',
  output: {
    filename: '[name].js',
  },
  devtool: 'source-map',
  plugins: [
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
    }),
  ],
});
