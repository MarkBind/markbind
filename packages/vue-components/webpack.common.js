const path = require('path');

module.exports = {
  entry: {
    'components': path.join(__dirname, 'src', 'index.js'),
  },
  output: {
    library: 'MarkBindVue',
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
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery',
          },
        ],
      },
    ],
  },
};
