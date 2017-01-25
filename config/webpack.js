const path = require('path');
const fs = require('fs');
const env = process.env;

const appConfig = require('./app');

const rootDirectory = fs.realpathSync(process.cwd());

function resolvePath(relativePath) {
  return path.resolve(rootDirectory, relativePath);
}

function strToBool(val, def) {
  if (val === undefined) {
    return def;
  }
  val = val.toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'y';
}

const options = {
  paths: {
    root: rootDirectory,
    build: resolvePath('build'),
    nodeModules: resolvePath('node_modules'),
    src: resolvePath('src')
  },
  dev: strToBool(env.DEV, true),
  livereload: strToBool(env.LIVERELOAD, false),
  hot: process.argv.indexOf('--hot') !== -1,
  hash: strToBool(env.HASH, false),
  uglify: strToBool(env.UGLIFY, false),
  port: env.PORT || '8080',
  appConfig: appConfig
};

module.exports = [
  // Main app config
  require('./webpack/app.js')(options),

  // Bookmarklet config
  require('./webpack/bookmarklet.js')(options)
];
