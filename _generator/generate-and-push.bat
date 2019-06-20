node bin --scrape --generate
if ERRORLEVEL 1 (
    exit /b 1
)
pushd ..
git add .
git commit -m "Build"
git gc --auto --quiet
git push origin gh-pages
popd
