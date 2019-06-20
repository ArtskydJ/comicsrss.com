node scrapers/dilbert
if ERRORLEVEL 1 (
    exit /b 1
)
node scrapers/gocomics
if ERRORLEVEL 1 (
    exit /b 1
)
node site-generator
if ERRORLEVEL 1 (
    exit /b 1
)
pushd ..
git add .
git commit -m "Build"
git gc --auto --quiet
git push origin gh-pages
popd
