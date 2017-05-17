#!/usr/bin/sh
cd ~/comicsrss.com/
git pull --ff-only origin gh-pages -q > /dev/null
node _generator
git add .
git commit -q -m "Build"
git push origin gh-pages -q
