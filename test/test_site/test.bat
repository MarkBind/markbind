@ECHO off

node ../../index.js build

node testUtil/test.js

if errorlevel 1 (
    echo Test Failed
) else (
    echo Test passed
)

exit /b %errorlevel%
