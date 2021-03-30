/* eslint-env node */
const path = require('path');
const { merge } = require('webpack-merge');

const config = require('./webpack.common.js');

module.exports = merge(config, {
  entry: {
    markbind: path.join(__dirname, 'src', 'index.js'),
  },
  externals: {
    vue: 'Vue',
  },
});
