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

echo Test passed
exit /b %errorlevel%
