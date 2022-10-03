#!/usr/bin/env sh

stash_count=$(git rev-list --walk-reflogs --count refs/stash)
git stash -q --include-untracked --keep-index
curr_stash_count=$(git rev-list --walk-reflogs --count refs/stash)

exit_code=1
echo "(pre-push) Cleaning compiled files..."
npm run clean

echo "(pre-push) Building backend..."
npm run build:backend

echo "(pre-push) Running tests..."
npm run test
exit_code=$?

if [ $curr_stash_count -gt $stash_count ]
then
  git stash pop -q
fi

if [ $exit_code -ne 0 ]
then
  echo "❌ (pre-push) Please fix failed testcases before pushing!"
  exit 1
else
  echo "✔ (pre-push) All testcases passed!"
  exit 0
fi