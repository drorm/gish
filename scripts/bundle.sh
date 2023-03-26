#!/bin/bash
set -e
export GISH_VERSION=`git describe --tags $(git rev-list --tags --max-count=1)`
echo $GISH_VERSION
npm run esb
npm run pkg
chmod 700 releases/$GISH_VERSION/*
ls -lt releases/$GISH_VERSION
