node scraper-dilbert
if ERRORLEVEL 1 (
    exit /b 1
)
node scraper
if ERRORLEVEL 1 (
    exit /b 1
)
node generator
if ERRORLEVEL 1 (
    exit /b 1
)
pushd ..
git add .
git commit -m "Build"
git gc --auto --quiet
git push origin gh-pages
popd
