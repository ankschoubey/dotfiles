#!/bin/bash

MAX_ITER=200
i=1
while [ $i -le $MAX_ITER ]
do
    ((i++))
    pkill node
    TESTS=$(find src/test/java -name "*Test.java" | sort)

    all_passed=true
    for test in $TESTS; do
        CLASS=$(echo "$test" \
            | sed 's#src/test/java/##' \
            | sed 's#/#.#g' \
            | sed 's#.java##')

        echo "▶ Running $CLASS"

        full_output=$(mvn test -Dtest="$CLASS" 2>&1)
        status=$?
        output=$(echo "$full_output" | tail -n 50)

        if [ $status -ne 0 ]; then
            all_passed=false
            opencode run "Fix test $CLASS output: $output. Follow guidelines in AGENTS.md"
        fi
    done

    if $all_passed; then
        echo "✅ All tests passed"
        break
    fi
done
