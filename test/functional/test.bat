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

for %%a in (%sites_convert%) do (

    echo(
    echo Running %%a tests

    node ../../index.js init %%a\non_markbind_site -c

    node ../../index.js build %%a\non_markbind_site

    xcopy %%a\non_markbind_site\_site %%a /i

    node testUtil/test.js %%a

    call set level=%%errorlevel%%

    rmdir /s /q %%a\_site
    rmdir /s /q %%a\non_markbind_site\_markbind
    rmdir /s /q %%a\non_markbind_site\_site
    del %%a\non_markbind_site\about.md %%a\non_markbind_site\index.md %%a\non_markbind_site\site.json

    if %level%==1 (
        echo Test %%a Failed
        exit /b %level%
    )
)

echo Test passed
exit /b %errorlevel%
