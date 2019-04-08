@ECHO off

set sites=test_site test_site_algolia_plugin

for %%a in (%sites%) do (

    echo(
    echo Running %%a tests

    node ../../index.js build %%a

    node testUtil/test.js %%a

    if errorlevel 1 (
        echo Test %%a Failed
        exit /b %errorlevel%
    )
)

set sites_convert=test_site_convert

for %%a in (%sites%) do (

    echo(
    echo Running %%a tests

    node ../../index.js init %%a -c

    node ../../index.js build %%a

    node testUtil/test.js %%a "test_site_convert_expected"

    rmdir /s /q %%a/_markbind
    rmdir /s /q %%a/_site
    del %%a/about.md %%a/index.md %%a/site.json

    if errorlevel 1 (
        echo Test %%a Failed
        exit /b %errorlevel%
    )
)

echo Test passed
exit /b %errorlevel%
