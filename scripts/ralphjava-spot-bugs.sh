#!/bin/bash
# Ralph loop for spotbugs. Delegates mechanics to _internal/ralph.sh.
# shellcheck disable=SC1091
source "$(dirname "$0")/_internal/ralph.sh"

ralph_loop "${MAX_ITER:-200}" "[ERROR] " \
  "Fix spotbugs. Skip fixing CT_CONSTRUCTOR_THROW by adding it to exclude-filter.xml" \
  "pkill node 2>/dev/null; mvn spotbugs:check | tail -n 50"
