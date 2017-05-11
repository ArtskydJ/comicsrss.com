#!/usr/bin/sh
cd ~/comicsrss.com/
#node _generator
git add .
git commit -q -m "Build"
git push origin gh-pages -q
