@ECHO off

for /f "tokens=* delims=" %%a in (test_sites) do (

    echo(
    echo Running %%a tests

    node ../../index.js build %%a

    node testUtil/test.js %%a

    if errorlevel 1 (
        echo Test %%a Failed
        exit /b %errorlevel%
    )
)

for /f "tokens=* delims=" %%a in (test_convert_sites) do (

    echo(
    echo Running %%a tests

    node ../../index.js init %%a\non_markbind_site -c

    node ../../index.js build %%a\non_markbind_site

    xcopy /i /q /s %%a\non_markbind_site\_site %%a\_site

    node testUtil/test.js %%a

    if errorlevel 1 (
        echo Test %%a Failed
        rmdir /s /q %%a\_site
        rmdir /s /q %%a\non_markbind_site\_markbind
        rmdir /s /q %%a\non_markbind_site\_site
        del %%a\non_markbind_site\about.md %%a\non_markbind_site\index.md %%a\non_markbind_site\site.json
        exit /b %errorlevel%
    )

    rmdir /s /q %%a\_site
    rmdir /s /q %%a\non_markbind_site\_markbind
    rmdir /s /q %%a\non_markbind_site\_site
    del %%a\non_markbind_site\about.md %%a\non_markbind_site\index.md %%a\non_markbind_site\site.json
)

echo Test passed
exit /b %errorlevel%
