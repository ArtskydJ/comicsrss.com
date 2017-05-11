#!/usr/bin/sh
cd ~/comicsrss.com/
node _generator
git add .
git commit -m "Build"
git push origin gh-pages
