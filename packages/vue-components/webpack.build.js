const { merge } = require('webpack-merge');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const config = require('./webpack.common.js');

module.exports = merge(config, {
  mode: 'production',
  output: {
    filename: '[name].min.js',
  },
  plugins: [new VueLoaderPlugin()],
});
