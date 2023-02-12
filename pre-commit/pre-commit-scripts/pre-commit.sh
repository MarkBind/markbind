#!/usr/bin/env sh

stash_count=$(git rev-list --walk-reflogs --count refs/stash)
git stash -q --include-untracked --keep-index
curr_stash_count=$(git rev-list --walk-reflogs --count refs/stash)

echo "(pre-commit) Cleaning compiled files..."
npm run clean

echo "(pre-commit) Building backend..."
npm run build:backend

linter_exit_code=0
echo "(pre-commit) Running lintfix..."
npm run lintfix
linter_exit_code=$?

if [ $curr_stash_count -gt $stash_count ]
then
  git stash pop -q
fi

if [ $linter_exit_code -ne 0 ]
then
  echo "❌ (pre-commit) Please fix linting errors before committing!"
  exit 1
else
  echo "✔ (pre-commit) ESLint and Stylelint did not find any unfixable errors!"
  echo "✔ (pre-commit) Some files may have been automatically lint fixed, which will cause pre-commit to fail."
  echo "✔ (pre-commit) Verify and stage these changes, then recommit as needed."
  exit 0
fi