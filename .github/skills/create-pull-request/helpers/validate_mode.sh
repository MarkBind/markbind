#!/bin/bash

# The first argument to this script should be the full user prompt/request
USER_MESSAGE=$(echo "$1" | tr '[:upper:]' '[:lower:]')

if [[ "$USER_MESSAGE" == *"draft"* ]]; then
    echo "MODE: DRAFT"
elif [[ "$USER_MESSAGE" == *"dry run"* ]] || [[ "$USER_MESSAGE" == *"dry-run"* ]]; then
    echo "MODE: DRY_RUN"
elif [[ "$USER_MESSAGE" == *"standard"* ]] || [[ "$USER_MESSAGE" == *"normal"* ]]; then
    echo "MODE: STANDARD"
else
    echo "MODE: UNDEFINED"
fi