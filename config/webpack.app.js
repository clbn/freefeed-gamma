const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const gitCommitDate = require('child_process').execSync('git show -s --format="%ci"').toString();

module.exports = function(opts) {
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
        { test: /[/]styles[/]app[.]scss$/,
          loader: styleLoader('css-loader?-mergeIdents&-mergeRules&-uniqueSelectors!sass-loader', cssAppExtractor)
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
      // Generate index.html
      new HtmlWebpackPlugin({
        template: 'src/index.html', // Input file (HTML template)
        templateParameters: opts, // Inject some <%= VARIABLES %> into the template
        inject: true, // Inject JS and CSS into the template (CSS appended to <head>, JS appended to <body>)
        filename: 'index.html' // Output file (inside the build folder)
      }),

      new webpack.LoaderOptionsPlugin({ debug: opts.dev }),

      new webpack.ContextReplacementPlugin(/moment[/]locale$/, /(?:en|ru)[.]js/),

      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(gitCommitDate.substr(0, 10).replace(/-/g, '.')),
        'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
      }),

      cssAppExtractor,

      new webpack.optimize.ModuleConcatenationPlugin(),

      opts.uglify && new webpack.optimize.UglifyJsPlugin({ sourceMap: true })
    ])
  };
};
