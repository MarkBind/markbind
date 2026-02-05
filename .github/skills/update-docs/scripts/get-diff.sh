#!/bin/bash

# Git diff script that supports optional base commit SHA parameter
# Usage: ./get-diff.sh [COMMIT_SHA]

# Check if a commit SHA parameter is provided
if [ $# -eq 1 ]; then
    # Use the provided commit SHA
    echo "Showing diff from commit: $1"
    git diff "$1"
else
    # Use the default: diff from fork point with master
    echo "Showing diff from fork point with master"
    git diff $(git merge-base --fork-point master)
fi
