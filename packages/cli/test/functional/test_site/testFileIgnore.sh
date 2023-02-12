#!/bin/bash
# This file should be ignored since it is included in the "ignore" array of the site.json

# build site in test/test_site/_site
node ../../index.js build

# run our test script to compare html files
node ./testUtil/test.js

if [ $? -eq 0 ]
then
# if there were no diffs
    echo "Test result: PASSED"
    exit 0
else
    echo "Test result: FAILED"
    exit 1
fi
