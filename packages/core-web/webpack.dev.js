/* eslint-env node */
const path = require('path');
const MFS = require('memory-fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const clientConfig = require('./webpack.client.config');
const serverConfig = require('./webpack.server.config');

module.exports = {
  clientEntry: (publicPath) => {
    const webpackClientDevConfig = merge(clientConfig, {
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
      ],
    });

    const compiler = webpack(webpackClientDevConfig);
    return [
      webpackDevMiddleware(compiler, {
        publicPath,
      }),
      webpackHotMiddleware(compiler),
    ];
  },
  serverEntry: (cb, rootFolder) => {
    const memDistFolder = path.join(rootFolder, 'dist');

    const webpackServerDevConfig = merge(serverConfig, {
      mode: 'development',
      output: {
        path: memDistFolder,
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
    });

    const serverCompiler = webpack(webpackServerDevConfig);
    const mfs = new MFS();
    serverCompiler.outputFileSystem = mfs;

    let bundle;
    const bundleFilePath = path.join(memDistFolder, 'js', 'vueCommonAppFactory.min.js');

    let ready;
    const readyPromise = new Promise((r) => { ready = r; });

    const updateBundle = () => {
      if (bundle) {
        ready();
        cb(bundle);
      }
    };

    // watch and update server renderer
    serverCompiler.watch({}, (err, stats) => {
      if (err) throw err;

      const statsJson = stats.toJson();
      if (statsJson.errors.length) {
        // eslint-disable-next-line no-console
        console.error(statsJson.errors);
        return;
      }

      bundle = mfs.readFileSync(bundleFilePath, 'utf-8');
      updateBundle();
    });

    return readyPromise;
  },
};
