#!/bin/bash
# Ralph loop for mvn compilation. Capped (was infinite).

MAX_ITER="${MAX_ITER:-200}"
i=1
while [ $i -le "$MAX_ITER" ]; do
  ((i++))
  if mvn clean test-compile; then
    break
  fi
  opencode run "Fix mvn clean test-compile. "
done
