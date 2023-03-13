#!/bin/bash
# Description: Gish is a command line tool for interacting with the OpenAI API
# This script is a wrapper for the node.js script that does the actual work
source ~/.openai
# Get the real path to this script in case it is a symlink
REAL_PATH=`realpath "$0"`
# Get the directory that this script is in
BASE_DIR=`dirname "$REAL_PATH"`
node ${BASE_DIR}/dist/index.js $*
