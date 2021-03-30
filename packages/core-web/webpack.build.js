const { merge } = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const config = process.env.ENTRY_POINT === 'client'
  ? require('./webpack.client.config')
  : require('./webpack.server.config');

/* eslint-env node */
module.exports = merge(config, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css',
    }),
  ],
});
