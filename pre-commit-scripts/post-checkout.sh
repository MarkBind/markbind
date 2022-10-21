#!/usr/bin/env sh

CHECKOUT_TYPE=$3 # "0" => file checkout, "1" => branch checkout

# This is a file checkout – do nothing
if [ "$CHECKOUT_TYPE" = "0" ]; then exit; fi

echo -e "(post-checkout) Cleaning compiled files..."
npm run clean

echo -e "(post-checkout) Building backend..."
npm run build:backend

echo -e "(post-checkout) Ready! Use 'markbind serve -d' to serve any MarkBind sites..."
