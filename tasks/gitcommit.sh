#!/bin/bash

out="The following is the output of git diff"
out+=`git diff $*`
out+="-----------------------------"

out+="The following is the output of git status"
out+=`git status --untracked-files=no $*`
out+="-----------------------------"

out+="based on the above provide a commit message"
echo $out | gish
