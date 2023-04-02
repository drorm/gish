#!/bin/bash
# Path: testLoop.sh
# Runs a command on a file repeatedly until it passes or the maximum number of iterations is reached.
# For instance: testLoop.sh  src/utils.ts "npx jest" 5
# This will run the command "npx jest test/utils.spec.ts" repeatedly until it passes or the maximum number: 5
# If the command fails, it will run gish on the original prompt + the output, the error messages, 

FILE=$1
CONTENTS=`cat $FILE`
COMMAND=$2
MAX_ITERATIONS=$3
ITERATIONS=0
TESTFILE="${FILE/src\//test\/}"
TESTFILE="${TESTFILE/.ts/.spec.ts}"
echo "Running gish to generate unit test for ${FILE} ..."
PROMPT="The following is a unit test for the typescript file: ${FILE}
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
$CONTENTS
--------------------------------------------
The following is the output of running the command: $COMMAND $TESTFILE
"


while [ $ITERATIONS -lt $MAX_ITERATIONS ]
do
    echo "Running tests... iteration $ITERATIONS"
    # run the command on the file
    RESULTS=$(eval $COMMAND $TESTFILE 2>&1)
    # if status is not 0, then there was an error
    if [[ $? != 0 ]]; then
        echo "Error found. Running gish with error message added as input..."
        NEW_PROMPT="$PROMPT
        $RESULTS
        provide a new version of the test. 
        Your response for this request needs to be code and nothing else."
        echo "$NEW_PROMPT"
        mv $TESTFILE $TESTFILE.${ITERATIONS}
        NEW_TEST=$(echo $NEW_PROMPT | gish --no-stats -s $TESTFILE) 
    else
        echo "All tests passed."
        exit 0
    fi
    ITERATIONS=$((ITERATIONS+1))
done
echo "Maximum number of iterations reached. Tests not passing."
exit 1
