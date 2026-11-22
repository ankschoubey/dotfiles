#!/bin/bash
# Ralph loop for vitest. Delegates mechanics to _internal/ralph.sh.
# shellcheck disable=SC1091
source "$(dirname "$0")/_internal/ralph.sh"

ralph_loop "${MAX_ITER:-200}" "1 failed" "Fix the failing test using this test output:" \
  "pkill node 2>/dev/null; npx vitest --bail=1 --silent | grep -v '❯ '; pkill node 2>/dev/null" \
  "pkill node 2>/dev/null || true"
