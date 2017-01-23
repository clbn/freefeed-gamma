module.exports = function(opts) {
  return {
    entry: {
      'bookmarklet-popup': './assets/bookmarklet-popup.js'
    },
    output: {
      path: opts.paths.build,
      filename: 'assets/[name]-wrap.js'
    },
    module: {
      loaders: [{
        test: /bookmarklet\-popup\.js$/,
        loader: 'file?name=assets/[name].[ext]'
      }]
    }
  };
};
