var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var PathRewriter = require('webpack-path-rewriter');
var TapWebpackPlugin = require('tap-webpack-plugin');

var gitCommitDate = require('child_process').execSync('git show -s --format="%ci"').toString();

var env = process.env;

var opts = {
  dstDir: env.DST_DIR || path.join(__dirname, '_dist'),
  dev: strToBool(env.DEV, true),
  livereload: strToBool(env.LIVERELOAD, false),
  hot: process.argv.indexOf('--hot') !== -1,
  hash: strToBool(env.HASH, false),
  uglify: strToBool(env.UGLIFY, false),
  port: env.PORT || '8080'
};

var cssCommonExtractor = new ExtractTextPlugin(
  opts.hash ? 'common-[contenthash].css' : 'common-dev.css',
  { allChunks: true }
);

var cssAppExtractor = new ExtractTextPlugin(
  opts.hash ? 'app-[contenthash].css' : 'app-dev.css',
  { allChunks: true }
);

module.exports = [{
  entry: {
    app: skipFalsy([
      opts.hot && 'webpack/hot/dev-server',
      'babel-polyfill',
      './src'
    ])
  },
  output: {
    path: opts.dstDir,
    filename: opts.hash ? '[name]-[chunkhash].js' : '[name]-dev.js',
    pathinfo: opts.dev
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    root: path.resolve(__dirname, 'src'),
    fallback: [ __dirname ]
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
},

// Bookmarklet config
{
  entry: {
    'bookmarklet-popup': './assets/bookmarklet-popup.js'
  },
  output: {
    path: opts.dstDir,
    filename: 'assets/[name]-wrap.js'
  },
  module: {
    loaders: [{
      test: /bookmarklet\-popup\.js$/,
      loader: 'file?name=assets/[name].[ext]'
    }]
  }
},

// Test build config
{
  entry: {
    test: './test'
  },
  output: {
    path: opts.dstDir,
    filename: '[name].js',
    pathinfo: opts.dev
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    root: path.resolve(__dirname, 'src'),
    fallback: [ __dirname ],
    alias: {
      'react/lib/ReactContext': 'moment'
    }
  },
  target: 'node',
  node: {
    fs: 'empty'
  },
  devtool: 'inline-source-map',
  debug: opts.dev,
  module: {
    preLoaders: [
      { test: /\.jsx?$/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      { test: /\.jsx?$/,
        exclude: /node_modules[/]/,
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
      },
      {
        test: /node_modules[/].*\.json$/,
        loader: 'raw'
      }
    ]
  },
  plugins: skipFalsy([
    new webpack.ContextReplacementPlugin(/moment[/]locale$/, /(?:en|ru)[.]js/),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
    }),

    new webpack.IgnorePlugin(/react\/addons/),

    new PathRewriter({
      includeHash: opts.livereload,
      emitStats: false,
      silent: false
    }),

    new TapWebpackPlugin(),
  ])
}];

function styleLoader(loader, extractor) {
  return opts.hot
    ? addSourceMapArg('style!' + loader)
    : extractor.extract(addSourceMapArg(loader));
}

function addSourceMapArg(loader) {
  return loader
    .split('!')
    .map(function(l) { return l.indexOf('?') == -1 ? l + '?sourceMap' : l + '&sourceMap'; })
    .join('!');
}

function strToBool(val, def) {
  if (val === undefined) {
    return def;
  }
  val = val.toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'y';
}

function skipFalsy(array) {
  return array.filter(function(item) { return !!item; });
}
