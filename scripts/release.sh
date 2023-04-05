#!/bin/bash
set -e

# create a Y/N prompt function
function prompt_yn {
    read -p "$1 (y/n) " -n 1 -r
    echo  # (optional) move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "Continuing..."
    else
        echo "Exiting..."
        exit 1
    fi
}

prompt_yn "Checking that dev branch is up to date. Continue?"
git co dev
git diff
git pull
 
# Create the binaries
echo "Creating binaries..."
scripts/bundle.sh

# Commit and push the binaries
echo "Committing and pushing binaries..."
git commit releases

echo "Merging dev into main..."
git co main 
git merge dev

echo "Tagging release..."
scripts/tag.sh

echo "Creating the version file..."
scripts/version.sh
