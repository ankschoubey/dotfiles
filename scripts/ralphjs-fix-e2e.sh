#!/bin/bash

# Ralph loop for fixing e2e tests
# Usage: ./ralph-fix-e2e.sh <test-file>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <test-file>"
    exit 1
fi

TEST_FILE=$1
MAX_ITER=200
i=1

while [ $i -le $MAX_ITER ]
do
    echo "Iteration $i: Running e2e test $TEST_FILE"
    ((i++))

    # Kill any existing node processes
    pkill node 2>/dev/null || true

    # Start dev server in background
    output=$(npm run test:e2e -- --max-failures=1 --workers=1 "$TEST_FILE" 2>&1 | grep -v '❯ ')

    # Kill dev server
    pkill node 2>/dev/null || true

    # Check if test failed
    if [[ "$output" == *"failed"* ]] || [[ "$output" == *"1 failed"* ]]; then
        opencode run "Fix the failing e2e test using this test output: $output. Follow guidelines in AGENTS.md"
    else
        echo "Tests passed!"
        break
    fi
done
