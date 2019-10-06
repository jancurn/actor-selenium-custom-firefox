#!/usr/bin/env bash

# This script install custom Firefox build to node_modules,
# so that it can be used from main.js

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  echo "Making custom Firefox build usable from Node.js (Linux)"

  # geckodriver needs to be in PATH
  ln -f -s /firefox/geckodriver ./node_modules/.bin/geckodriver

elif [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Copying custom Firefox build to node_modules (macOS)"

  mkdir -p ./node_modules/custom_firefox
  mkdir -p ./node_modules/.bin

  unzip -o ./custom_firefox/mac/firefox.mac.zip -d ./node_modules/custom_firefox/
  cp ./custom_firefox/mac/geckodriver ./node_modules/custom_firefox/

  # geckodriver needs to be in PATH
  ln -f -s ../custom_firefox/geckodriver ./node_modules/.bin/geckodriver
else
   echo "Unsupported operating system: $OSTYPE"
   exit 1
fi
