#!/bin/bash

for site in $(cat test_sites);
do
    # print site name
    echo "Updating $site"

    # build site
    node ../../index.js build "$site"

    # replace the expected folder with the newly generated files
    rm -rf $site/expected
    cp -r $site/_site $site/expected
done

function cleanup_convert {
    # delete generated files
    rm -rf $site_convert/_site
    rm -rf $site_convert/non_markbind_site/_markbind $site_convert/non_markbind_site/_site
    rm -f $site_convert/non_markbind_site/about.md $site_convert/non_markbind_site/index.md "$site_convert"/non_markbind_site/site.json
}

for site_convert in $(cat test_convert_sites);
do
    # print site name
    echo "Updating $site_convert test"

    # set cleanup trap
    trap cleanup_convert EXIT

    # convert site
    node ../../index.js init $site_convert/non_markbind_site -c

    # build site
    node ../../index.js build $site_convert/non_markbind_site

    # replace the expected folder with the newly generated files
    rm -rf $site_convert/expected
    cp -r $site_convert/non_markbind_site/_site $site_convert/expected

    # cleanup generated files
    cleanup_convert

    # remove trap
    trap - EXIT
done

for siteInfo in $(cat test_template_sites);
do
    flag=$(cut -d',' -f1 <<<"$siteInfo")
    site=$(cut -d',' -f2 <<<"$siteInfo")

    # print site name
    echo "Updating $site test"

    # convert site
    node ../../index.js init $site/tmp --template $flag
    node ../../index.js build $site/tmp

    # replace the expected folder with the newly generated files
    rm -rf $site/expected
    cp -r $site/tmp/_site $site/expected

    # remove generated files
    rm -rf $site/tmp

done

echo "Updated all test sites"
exit 0
