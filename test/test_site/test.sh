#! /bin/bash

node ../../index.js build

node ./testUtil/test.js

if [ $? -eq 0 ]
then
    echo "Test result: PASSED"
    exit 0
else
    echo "Test result: FAILED"
    exit 1
fi
