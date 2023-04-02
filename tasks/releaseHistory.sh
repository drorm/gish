#!/bin/bash

# Usage: releaseHistory.sh <firstVersion> <secondVersion>
if [ $# -ne 2 ]; then
    echo "Usage: $0 <firstVersion> <secondVersion>"
    exit 1
fi

out="The following is the output of git log between versions $*"
out+=`git log --pretty=format:"%s" $1..$2 | grep -v "Merge branch"`
# pretty echo out
echo 
out+="-----------------------------"
out+="based on the above provide release notes"
# echo $out | gish
echo $out
