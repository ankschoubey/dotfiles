#!/bin/bash

TEST_FILE="MUTATION_TO_DO.txt"

while [ -s "$TEST_FILE" ]; do
  file=$(head -1 "$TEST_FILE")
  echo "Processing file: $file"

  output=$(./run-one-mutation.sh "$file")

  if [[ -z "$output" ]]; then
    sed -i '' '1d' "$TEST_FILE"
    continue
  fi

  echo "$output"

  prompt=$(cat <<EOF
This is the output of ./run-one-mutation.sh $file:

$output

Goal: Categorize whether mutations are pointing to actual issues.
- If all mutations are CSS-related, respond with <ONLY_CSS_LEFT>.
- If there are mutations pointing to critical assertions, fix them and rerun tests until no critical mutations are left.
- If you believe there are no critical mutations left, respond with <NO_CRITICAL_MUTATIONS_LEFT>.
EOF
)

  agentOutput=$(opencode run "$prompt")

  if [[ "$agentOutput" == *"<ONLY_CSS_LEFT>"* || \
        "$agentOutput" == *"<NO_CRITICAL_MUTATIONS_LEFT>"* ]]; then
    sed -i '' '1d' "$TEST_FILE"
  fi
  pkill node
done
