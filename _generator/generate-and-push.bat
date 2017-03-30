node .
if ERRORLEVEL 1 (
    exit /b 1
)
pushd ..
git add .
git commit -m "Build"
git push origin gh-pages
popd
