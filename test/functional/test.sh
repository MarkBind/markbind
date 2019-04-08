#!/bin/bash

declare -a sites=("test_site" "test_site_algolia_plugin")

for site in "${sites[@]}"
do
    # print site name
    echo
    echo "Running $site tests"

    # build site
    node ../../index.js build "$site"

    # run our test script to compare html files
    node testUtil/test.js "$site"

    if [ $? -ne 0 ]
    then
        echo "Test result: $site FAILED"
        exit 1
    fi
done

declare -a sites_convert=("test_site_convert")

for site in "${sites_convert[@]}"
do
    # print site name
    echo
    echo "Running $site tests"

    # convert site
    node ../../index.js init "$site" -c

    # build site
    node ../../index.js build "$site"

    # run our test script to compare html files
    node testUtil/test.js "$site" "test_site_convert_expected"

    # delete generated files
    rm -rf "$site"/_markbind "$site"/_site
    rm "$site"/about.md "$site"/index.md "$site"/site.json

    if [ $? -ne 0 ]
    then
        echo "Test result: $site FAILED"
        exit 1
    fi
done

# if there were no diffs
echo "Test result: PASSED"
exit 0
