const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PathRewriter = require('webpack-path-rewriter');
const Visualizer = require('webpack-visualizer-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

const gitCommitDate = require('child_process').execSync('git show -s --format="%ci"').toString();

module.exports = function(opts) {
  const cssCommonExtractor = new ExtractTextPlugin({
    filename: opts.hash ? 'common-[contenthash].css' : 'common-dev.css',
    allChunks: true
  });

  const cssAppExtractor = new ExtractTextPlugin({
    filename: opts.hash ? 'app-[contenthash].css' : 'app-dev.css',
    allChunks: true
  });

  const styleLoader = function(loader, extractor) {
    return opts.hot
      ? addSourceMapArg('style-loader!' + loader)
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
      app: [
        'babel-polyfill',
        './src'
      ]
    },
    output: {
      path: opts.paths.build,
      filename: opts.hash ? '[name]-[chunkhash].js' : '[name]-dev.js',
      pathinfo: opts.dev
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      modules: [
        opts.paths.src,
        opts.paths.nodeModules,
        opts.paths.root
      ]
    },
    devtool: opts.dev ? 'cheap-module-eval-source-map' : 'source-map',
    devServer: {
      historyApiFallback: true
    },
    module: {
      rules: [
        { test: /\.jsx?$/,
          exclude: /(node_modules[/]|test[/])/,
          use: [
            'babel-loader',
            'eslint-loader'
          ],
          enforce: 'pre'
        },
        { test: /[/]styles[/]common[/].*[.]scss$/,
          loader: styleLoader('css-loader?-mergeIdents&-mergeRules&-uniqueSelectors!sass-loader', cssCommonExtractor)
        },
        { test: /[/]styles[/]helvetica[/].*[.]scss$/,
          loader: styleLoader('css-loader?-mergeIdents&-mergeRules&-uniqueSelectors!sass-loader', cssAppExtractor)
        },
        { test: /[.]html$/,
          loader: PathRewriter.rewriteAndEmit({
            name: '[path][name].html'
          })
        },
        { test: /[.]jade$/,
          loader: PathRewriter.rewriteAndEmit({
            name: '[path][name].html',
            loader: 'jade-html-loader?' + JSON.stringify({ pretty: true, opts: opts })
          })
        },
        // Font Awesome assets
        { test: /fontawesome\-webfont\.(eot|svg|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader?name=assets/fonts/font-awesome/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
        },
        // PhotoSwipe assets
        { test: /photoswipe.+\.(png|svg|gif)$/,
          loader: 'file-loader?name=assets/images/photoswipe/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
        },
        // Local assets
        { test: /[/]assets[/]/,
          loader: 'file-loader?name=' + (opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]')
        }
      ]
    },
    plugins: skipFalsy([
      new Visualizer({
        filename: '../webpack-visualizer.html'
      }),

      opts.dev && new DashboardPlugin(),

      new webpack.LoaderOptionsPlugin({ debug: opts.dev }),

      new webpack.ContextReplacementPlugin(/moment[/]locale$/, /(?:en|ru)[.]js/),

      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(gitCommitDate.substr(0, 10).replace(/-/g, '.')),
        'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
      }),

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
