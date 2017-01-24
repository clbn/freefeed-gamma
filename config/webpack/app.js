const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PathRewriter = require('webpack-path-rewriter');
const Visualizer = require('webpack-visualizer-plugin');

const gitCommitDate = require('child_process').execSync('git show -s --format="%ci"').toString();

module.exports = function(opts) {
  const cssCommonExtractor = new ExtractTextPlugin(
    opts.hash ? 'common-[contenthash].css' : 'common-dev.css',
    { allChunks: true }
  );

  const cssAppExtractor = new ExtractTextPlugin(
    opts.hash ? 'app-[contenthash].css' : 'app-dev.css',
    { allChunks: true }
  );

  const styleLoader = function(loader, extractor) {
    return opts.hot
      ? addSourceMapArg('style!' + loader)
      : extractor.extract(addSourceMapArg(loader));
  };

  const addSourceMapArg = function(loader) {
    return loader
      .split('!')
      .map(function(l) { return l.indexOf('?') == -1 ? l + '?sourceMap' : l + '&sourceMap'; })
      .join('!');
  };

  const skipFalsy = function(array) {
    return array.filter(function(item) { return !!item; });
  };

  return {
    entry: {
      app: skipFalsy([
        opts.hot && 'webpack/hot/dev-server',
        'babel-polyfill',
        './src'
      ])
    },
    output: {
      path: opts.paths.build,
      filename: opts.hash ? '[name]-[chunkhash].js' : '[name]-dev.js',
      pathinfo: opts.dev
    },
    resolve: {
      extensions: ['', '.js', '.json', '.jsx'],
      root: opts.paths.src,
      fallback: [ opts.paths.root ]
    },
    devtool: opts.dev ? 'cheap-module-eval-source-map' : 'source-map',
    devServer: {
      historyApiFallback: true
    },
    debug: opts.dev,
    module: {
      preLoaders: [
        { test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        }
      ],
      loaders: [
        { test: /\.jsx?$/,
          exclude: /(node_modules[/]|test[/])/,
          loader: 'babel'
        },
        { test: /[/]styles[/]common[/].*[.]scss$/,
          loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssCommonExtractor)
        },
        { test: /[/]styles[/]helvetica[/].*[.]scss$/,
          loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssAppExtractor)
        },
        { test: /[.]html$/,
          loader: PathRewriter.rewriteAndEmit({
            name: '[path][name].html'
          })
        },
        { test: /[.]jade$/,
          loader: PathRewriter.rewriteAndEmit({
            name: '[path][name].html',
            loader: 'jade-html?' + JSON.stringify({ pretty: true, opts: opts })
          })
        },
        // Font Awesome assets
        { test: /fontawesome\-webfont\.(eot|svg|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file?name=assets/fonts/font-awesome/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
        },
        // PhotoSwipe assets
        { test: /photoswipe.+\.(png|svg|gif)$/,
          loader: 'file?name=assets/images/photoswipe/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
        },
        // Local assets
        { test: /[/]assets[/]/,
          loader: 'file?name=' + (opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]')
        }
      ]
    },
    plugins: skipFalsy([
      new Visualizer({
        filename: '../webpack-visualizer.html'
      }),

      new webpack.ContextReplacementPlugin(/moment[/]locale$/, /(?:en|ru)[.]js/),

      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(gitCommitDate.substr(0, 10).replace(/-/g, '.')),
        'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
      }),

      new webpack.optimize.OccurenceOrderPlugin(),

      cssCommonExtractor,
      cssAppExtractor,

      new PathRewriter({
        includeHash: opts.livereload,
        emitStats: false,
        silent: false
      }),

      opts.uglify && new webpack.optimize.UglifyJsPlugin()
    ])
  };
};
