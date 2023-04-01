#!/bin/bash

set -e
VERSION_FILE=src/version.ts
GIT=`git describe --tags $(git rev-list --tags --max-count=1)`
DATE=`date`
echo -e "export const vars = {\n \
  version: '${GIT}',\n \
  released: '${DATE}'\n \
  };\n" > ${VERSION_FILE}
cat ${VERSION_FILE}
