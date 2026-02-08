#!/bin/bash

# 1. Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
REMOTE_NAME="origin"
DEFAULT_BRANCH=$(git remote show $REMOTE_NAME | grep 'HEAD branch' | cut -d' ' -f5)

# 2. Upstream Verification
# Checks if a remote named 'upstream' exists
UPSTREAM_URL=$(git remote get-url upstream 2>/dev/null)
if [ -z "$UPSTREAM_URL" ]; then
    UPSTREAM_STATUS="MISSING"
else
    UPSTREAM_STATUS="EXISTS"
fi

# 3. Fetch latest from origin to ensure analysis is current
git fetch $REMOTE_NAME $DEFAULT_BRANCH --quiet

# 4. Generate Analysis Data
COMMIT_COUNT=$(git rev-list --count $REMOTE_NAME/$DEFAULT_BRANCH..HEAD)
DIFF_STAT=$(git diff $REMOTE_NAME/$DEFAULT_BRANCH..HEAD --stat)

echo "---CONTEXT_DATA---"
echo "CURRENT_BRANCH: $CURRENT_BRANCH"
echo "BASE_REMOTE: $REMOTE_NAME"
echo "BASE_BRANCH: $DEFAULT_BRANCH"
echo "UPSTREAM_STATUS: $UPSTREAM_STATUS"
echo "UPSTREAM_URL: $UPSTREAM_URL"
echo "AHEAD_BY: $COMMIT_COUNT"
echo "DIFF_SUMMARY:"
echo "$DIFF_STAT"
echo "---END_CONTEXT_DATA---"