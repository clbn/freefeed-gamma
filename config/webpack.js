const path = require('path');
const fs = require('fs');

const appConfig = require('./config');

const rootDirectory = fs.realpathSync(process.cwd());

function resolvePath(relativePath) {
  return path.resolve(rootDirectory, relativePath);
}

const options = {
  paths: {
    root: rootDirectory,
    build: resolvePath('build'),
    nodeModules: resolvePath('node_modules'),
    src: resolvePath('src')
  },
  appConfig: appConfig,
  dev: path.basename(require.main.filename) === 'webpack-dev-server.js'
};

module.exports = [
  // Main app config
  require('./webpack.app.js')(options),

  // Bookmarklet config
  require('./webpack.bookmarklet.js')(options)
];
