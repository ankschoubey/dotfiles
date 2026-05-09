#!/bin/bash

MAX_ITER=200
i=1
while [ $i -le $MAX_ITER ]
do
    ((i++))
    pkill node
    output=$(npx vitest --bail=1 --silent | grep -v '❯ ' 2>&1)
    pkill node
    if [[ "$output" == *"1 failed"* ]]; then
        opencode run "Fix the failing test using this test output: $output. Follow guidelines in AGENTS.md"
    else
        echo "Tests passed!"
        break
    fi
    pkill node
done
