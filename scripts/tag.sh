#!/bin/bash
echo Enter tag version
read tag 
echo tag ${tag} ?
echo Enter to continue, ^C to abort
read confirm
git tag ${tag} -a
git push origin --tags
