#!/usr/bin/sh
cd ~/comicsrss.com/
git pull --ff-only origin gh-pages &> /dev/null
node _generator

