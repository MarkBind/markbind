@ECHO off

for /f "tokens=* delims=" %%a in (test_sites) do (

    echo(
    echo Updating %%a

    node ../../index.js build %%a

    rmdir /s /q %%a\expected
    xcopy /e /y /i /q %%a\_site %%a\expected
)

for /f "tokens=* delims=" %%a in (test_convert_sites) do (

    echo(
    echo Updating %%a

    node ../../index.js init %%a\non_markbind_site -c

    node ../../index.js build %%a\non_markbind_site

    rmdir /s /q %%a\expected
    xcopy /e /y /i /q %%a\non_markbind_site\_site %%a\expected

    rmdir /s /q %%a\_site
    rmdir /s /q %%a\non_markbind_site\_markbind
    rmdir /s /q %%a\non_markbind_site\_site
    del %%a\non_markbind_site\about.md %%a\non_markbind_site\index.md %%a\non_markbind_site\site.json
)

for /f "tokens=1-2 delims=," %%a in (test_template_sites) do (
    echo Running %%b test

    node ../../index.js init %%b\tmp --template %%a
    node ../../index.js build %%b\tmp

    rmdir /s/q "%%b\expected"
    xcopy /e /y /i /q "%%b\tmp\_site" "%%b\expected"
    rmdir /s/q "%%b\tmp"
)

echo Updated all test sites
exit /b %errorlevel%