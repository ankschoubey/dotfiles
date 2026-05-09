#!/bin/bash

MAX_ITER=200
i=1
while [ $i -le $MAX_ITER ]
do
    ((i++))
    pkill node
    output=$(mvn spotbugs:check | tail -n 50 2>&1)
    if [[ "$output" == *"[ERROR] "* ]]; then
        opencode run "Fix `mvn spotbugs:check | tail -n 50` output: $output. Skip fixing CT_CONSTRUCTOR_THROW by adding it to exclude-filter.xml Follow guidelines in AGENTS.md"
    else
        echo "Spotbugs passed!"
        break
    fi
done
