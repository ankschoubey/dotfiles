#!/bin/bash

while true; do
  mvn clean test-compile
  status=$?
  if [ $status -ne 0 ]; then
    opencode run "Fix mvn clean test-compile. "
  else
    break
  fi
done
