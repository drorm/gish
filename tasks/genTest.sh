#!/bin/bash
# Path: genTest.sh
# Generates a unit test for a typescript file using gish
set -e
FILE=$1
TESTFILE="${FILE/src\//test\/}"
TESTFILE="${TESTFILE/.ts/.spec.ts}"
echo "Running gish to generate unit test for ${FILE} ..."
PROMPT="Create a jest unit test for the typescript file: ${FILE}
The directory structure is as follows:
package.json
src/
    index.js
    ${FILE}
    ..
test/
    index.spec.js
    ..
the file resides in the src directory and the test file is in the test directory. So the imports should 
be relative to the test directory. For example, if the file is src/sum.ts, the new file import statement should
be import sum from '../src/sum.js'
--------------------------------------------
"

PROMPT+=`cat $FILE`

TEST=$(gish --no-stats "$PROMPT")
echo "$TEST" > $TESTFILE
echo "Created test file: $TESTFILE"
