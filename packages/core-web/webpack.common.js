/* eslint-env node */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  context: __dirname,
  output: {
    filename: 'js/[name].min.js',
    library: 'MarkBind',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
  resolve: {
    modules: [path.resolve(__dirname), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules|vue\/src|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
        use: [
          {
            loader: 'babel-loader',
            options: {
              root: __dirname,
              rootMode: 'upward',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
