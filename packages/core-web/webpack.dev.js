const { merge } = require('webpack-merge');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const config = require('./webpack.common.js');

module.exports = merge(config, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
});
