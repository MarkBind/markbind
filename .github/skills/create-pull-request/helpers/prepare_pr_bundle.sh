#!/bin/bash

# 1. Get Upstream Details
UPSTREAM_REPO=$(git remote get-url upstream | sed 's/.*github.com[\/:]//;s/\.git$//')
UPSTREAM_OWNER=$(echo "$UPSTREAM_REPO" | cut -d'/' -f1)

# 2. Get Head Details (Your Fork)
MY_USERNAME=$(gh api user -q .login)
CURRENT_BRANCH=$(git branch --show-current)

# 3. Read Template (if exists)
TEMPLATE_PATH=".github/PULL_REQUEST_TEMPLATE"
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo "STATUS: TEMPLATE_MISSING"
else
    echo "STATUS: TEMPLATE_FOUND"
fi

echo "---PR_BUNDLE_START---"
echo "UPSTREAM: $UPSTREAM_REPO"
echo "HEAD_STRING: $MY_USERNAME:$CURRENT_BRANCH"
echo "---PR_BUNDLE_END---"