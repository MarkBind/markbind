#!/bin/bash

# 1. Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
LOCAL_MASTER="master"

# Verify local master exists (fall back to main if necessary)
if ! git rev-parse --verify "$LOCAL_MASTER" &>/dev/null; then
    LOCAL_MASTER="main"
fi

# 2. Upstream Verification
# Check if 'upstream' remote exists
UPSTREAM_URL=$(git remote get-url upstream 2>/dev/null)
if [ -z "$UPSTREAM_URL" ]; then
    UPSTREAM_STATUS="MISSING"
else
    UPSTREAM_STATUS="EXISTS"
fi

# 3. Generate Analysis Data
# We compare HEAD (current branch) against the LOCAL_MASTER identified in step 1
COMMIT_COUNT=$(git rev-list --count $LOCAL_MASTER..HEAD)
DIFF_STAT=$(git diff $LOCAL_MASTER..HEAD --stat)

echo "---CONTEXT_DATA---"
echo "CURRENT_BRANCH: $CURRENT_BRANCH"
echo "COMPARISON_BASE: $LOCAL_MASTER"
echo "UPSTREAM_STATUS: $UPSTREAM_STATUS"
echo "UPSTREAM_URL: $UPSTREAM_URL"
echo "AHEAD_BY: $COMMIT_COUNT"
echo "DIFF_SUMMARY:"
echo "$DIFF_STAT"
echo "---END_CONTEXT_DATA---"