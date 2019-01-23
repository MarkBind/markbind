#!/bin/bash

declare -a sites=("test_site" "test_site_2")

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

# if there were no diffs
echo "Test result: PASSED"
exit 0
