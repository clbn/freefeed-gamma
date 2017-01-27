#!/bin/sh
set -e

: "${PORT:=8080}"

if ! [ -f './config/app.js' ]; then
  echo 'Copying config.js...'
  cp ./config/app.dist.js ./config/app.js
  echo 'Done!'
  echo
fi

if ! [ -d './node_modules' ]; then
  echo 'Installing required NPM modules...'
  npm install
  echo 'Done!'
  echo
fi

if [ "$1" != "-O" ]; then
  ( sleep 2 && open "http://localhost:$PORT/" ) &
fi

set -x; PORT="$PORT" DEV=1 LIVERELOAD=1 exec ./node_modules/.bin/webpack-dashboard -- ./node_modules/.bin/webpack-dev-server \
  --config ./config/webpack.js \
  --port $PORT \
  --host 0.0.0.0 \
  --output-public-path "http://localhost:$PORT/" \
  --colors \
  --hot
