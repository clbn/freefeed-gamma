#!/bin/sh
set -e

: "${OUT_DIR:=./build}"
: "${PUBLIC_PATH:=/}"

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

rm -rf $OUT_DIR

set -x; UGLIFY=1 HASH=1 DEV=0 exec ./node_modules/.bin/webpack \
  --config ./config/webpack.js \
  --output-path $OUT_DIR \
  --output-public-path $PUBLIC_PATH
