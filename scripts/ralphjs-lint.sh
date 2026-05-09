#!/bin/bash

MAX_ITER=200
i=1
while [ $i -le $MAX_ITER ]
do
    ((i++))
    pkill node
    output=$(npx eslint . | head -n 50 2>&1)
    pkill node
    if [[ "$output" == *" error "* ]]; then
        opencode run "Fix `npx eslint . | head -n 50` output: $output. Follow guidelines in AGENTS.md"
    else
        echo "Tests passed!"
        break
    fi
    ./ralphjs-fix-test.sh
done
