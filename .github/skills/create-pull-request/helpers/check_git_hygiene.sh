#!/bin/bash

# 1. Determine the correct base branch (master vs main)
BASE_BRANCH="master"
if ! git rev-parse --verify "$BASE_BRANCH" &>/dev/null; then
    BASE_BRANCH="main"
fi

# 2. Check for Merge Commits
MERGE_COMMITS=$(git rev-list --merges "$BASE_BRANCH"..HEAD)

# 3. Check for Atomic Commit potential (Size check)
# Flags commits that touch more than 10 files as potentially non-atomic
LARGE_COMMITS=$(git log "$BASE_BRANCH"..HEAD --pretty=format:"%H" | while read hash; do
    count=$(git diff-tree --no-commit-id --name-only -r $hash | wc -l)
    if [ "$count" -gt 10 ]; then echo "$hash ($count files)"; fi
done)

# 4. Check if Local is behind Upstream Main
git fetch upstream "$BASE_BRANCH" --quiet
BEHIND_COUNT=$(git rev-list --count HEAD..upstream/$BASE_BRANCH)

echo "---HYGIENE_START---"
echo "MERGE_COMMITS_FOUND: ${MERGE_COMMITS:-None}"
echo "LARGE_COMMITS: ${LARGE_COMMITS:-None}"
echo "BEHIND_UPSTREAM: $BEHIND_COUNT"
echo "BASE_BRANCH_USED: $BASE_BRANCH"
echo "---HYGIENE_END---"