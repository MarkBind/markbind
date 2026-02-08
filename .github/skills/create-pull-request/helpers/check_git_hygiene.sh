#!/bin/bash

# 1. Check for Merge Commits
MERGE_COMMITS=$(git rev-list --merges origin/master..HEAD)

# 2. Check for Atomic Commit potential (Size check)
# Flags commits that touch more than 10 files as potentially non-atomic
LARGE_COMMITS=$(git log origin/master..HEAD --pretty=format:"%H" | while read hash; do
    count=$(git diff-tree --no-commit-id --name-only -r $hash | wc -l)
    if [ "$count" -gt 10 ]; then echo "$hash ($count files)"; fi
done)

# 3. Check if Local is behind Upstream Main
git fetch upstream main --quiet
BEHIND_COUNT=$(git rev-list --count HEAD..upstream/main)

echo "---HYGIENE_START---"
echo "MERGE_COMMITS_FOUND: ${MERGE_COMMITS:-None}"
echo "LARGE_COMMITS: ${LARGE_COMMITS:-None}"
echo "BEHIND_UPSTREAM_MAIN: $BEHIND_COUNT"
echo "---HYGIENE_END---"