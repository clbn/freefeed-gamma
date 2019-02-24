const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const gitCommitDate = require('child_process').execSync('git show -s --format="%ci"').toString();

module.exports = function(opts) {
  return {
    mode: opts.dev ? 'development' : 'production',

    devtool: opts.dev ? 'cheap-module-eval-source-map' : 'source-map',

    devServer: {
      historyApiFallback: true,

      // Customize CLI output for "yarn start" (development mode)
      stats: {
        ...opts.stats,
        children: true
      }
    },

    // Customize CLI output for "yarn build" (production mode)
    stats: opts.stats,

    entry: {
      app: [
        '@babel/polyfill',
        './src'
      ]
    },

    output: {
      path: opts.paths.build,
      filename: opts.dev ? '[name]-dev.js' : '[name]-[chunkhash].js',
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

    module: {
      rules: [
        // JavaScript files
        { test: /\/(src|config)\/.+\.jsx?$/,
          use: [
            'babel-loader',
            'eslint-loader'
          ],
          enforce: 'pre'
        },

        // CSS files
        { test: /\/styles\/[\w\-]+\.scss$/,
          use: [
            opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
            opts.dev ? 'css-loader?sourceMap' : 'css-loader',
            'sass-loader'
          ],
        },

        // PhotoSwipe assets
        { test: /photoswipe.+\.(png|svg|gif)$/,
          loader: 'file-loader?name=assets/images/photoswipe/' + (opts.dev ? '[name]-dev.[ext]' : '[name]-[hash].[ext]')
        },

        // Local assets
        { test: /[/]assets[/]/,
          loader: 'file-loader?name=' + (opts.dev ? '[path][name]-dev.[ext]' : '[path][name]-[hash].[ext]')
        }
      ]
    },

    plugins: [
      // Generate index.html
      new HtmlWebpackPlugin({
        template: 'src/index.html', // Input file (HTML template)
        templateParameters: opts, // Inject some <%= VARIABLES %> into the template
        inject: true, // Inject JS and CSS into the template (CSS appended to <head>, JS appended to <body>)
        filename: 'index.html' // Output file (inside the build folder)
      }),

      // Generate CSS file
      new MiniCssExtractPlugin({
        filename: opts.dev ? 'app-dev.css' : 'app-[contenthash].css',
        allChunks: true
      }),

      new webpack.ContextReplacementPlugin(/moment[/]locale$/, /(?:en|ru)[.]js/),

      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(gitCommitDate.substr(0, 10).replace(/-/g, '.'))
      }),

      new webpack.optimize.ModuleConcatenationPlugin()
    ]
  };
};
