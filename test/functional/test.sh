#!/bin/bash

for site in $(cat test_sites);
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

function cleanup_convert {
    # delete generated files
    rm -rf $site_convert/_site
    rm -rf $site_convert/non_markbind_site/_markbind $site_convert/non_markbind_site/_site
    rm -f $site_convert/non_markbind_site/about.md $site_convert/non_markbind_site/index.md $site_convert/non_markbind_site/site.json
}

for site_convert in $(cat test_convert_sites);
do
    # print site name
    echo "Running $site_convert test"

    # set cleanup trap
    trap cleanup_convert EXIT

    # convert site
    node ../../index.js init $site_convert/non_markbind_site -c

    # build site
    node ../../index.js build $site_convert/non_markbind_site

    # copy generated site
    cp -r $site_convert/non_markbind_site/_site $site_convert

    # run our test script to compare html files
    node testUtil/test.js $site_convert

    if [ $? -ne 0 ]
    then
        echo "Test result: $site_convert FAILED"
        exit 1
    fi

    # cleanup generated files
    cleanup_convert

    # remove trap
    trap - EXIT
done

# if there were no diffs
echo "Test result: PASSED"
exit 0
