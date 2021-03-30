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
  serverEntry: (cb) => {
    const readFile = (fs, file) => {
      try {
        const test = `/Users/jamesongwx/Documents/GitHub/markbind/docs/dist/js/${file}`;
        // const test = `/Users/jamesongwx/Desktop/markbind/test2/dist/js/${file}`;
        return fs.readFileSync(test, 'utf-8');
      } catch (e) {
        console.log(e);
      }
    };

    let bundle;
    let ready;
    const readyPromise = new Promise((r) => { ready = r; });
    const updateBundle = () => {
      if (bundle) {
        ready();
        cb(bundle);
      }
    };

    const webpackServerDevConfig = merge(serverConfig, {
      mode: 'development',
      // output: publicPath,
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

    // watch and update server renderer
    const serverCompiler = webpack(webpackServerDevConfig);
    const mfs = new MFS();
    serverCompiler.outputFileSystem = mfs;

    serverCompiler.watch({}, (err, stats) => {
      console.log('Server Bundle Update (MarkBindVue)');

      if (err) throw err;
      stats = stats.toJson();
      if (stats.errors.length) {
        console.log(stats.errors);
        return;
      }

      bundle = readFile(mfs, 'markbindvue.min.js');
      updateBundle();
    });

    return readyPromise;
  },
};
