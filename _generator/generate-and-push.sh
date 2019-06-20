#!/usr/bin/sh
cd ~/comicsrss.com/
git pull --ff-only origin gh-pages -q > /dev/null
node _generator/bin --scrape --generate
git add .
git commit -q -m "Build"
git gc --auto --quiet
git push origin gh-pages -q
