const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./webpack.common.js');

module.exports = (publicPath) => {
  const webpackDevConfig = merge(config, {
    mode: 'development',
    entry: {
      markbind: ['webpack-hot-middleware/client', path.join(__dirname, 'src', 'index.js')],
    },
    output: {
      publicPath,
    },
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
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new VueLoaderPlugin(),
    ],
  });

  const compiler = webpack(webpackDevConfig);
  return [
    webpackDevMiddleware(compiler, {
      publicPath,
    }),
    webpackHotMiddleware(compiler),
  ];
};
