#!/bin/sh
set -e

: "${OUT_DIR:=./build}"
: "${PUBLIC_PATH:=/}"

if ! [ -f './config/config.js' ]; then
  echo 'Copying config.js...'
  cp ./config/config.dist.js ./config/config.js
  echo 'Done!'
  echo
fi

if ! [ -d './node_modules' ]; then
  echo 'Installing required NPM modules...'
  yarn install
  echo 'Done!'
  echo
fi

rm -rf $OUT_DIR

set -x; exec ./node_modules/.bin/webpack \
  --config ./config/webpack.js \
  --output-path $OUT_DIR \
  --output-public-path $PUBLIC_PATH
