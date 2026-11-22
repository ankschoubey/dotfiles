#!/bin/bash
# Ralph loop for fixing e2e tests. Delegates mechanics to _internal/ralph.sh.
# Usage: ./ralphjs-fix-e2e.sh <test-file>
# shellcheck disable=SC1091
source "$(dirname "$0")/_internal/ralph.sh"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <test-file>"
  exit 1
fi

# "failed" also matches the old "1 failed" check.
ralph_loop "${MAX_ITER:-200}" "failed" "Fix the failing e2e test using this test output:" \
  "pkill node 2>/dev/null || true; npm run test:e2e -- --max-failures=1 --workers=1 \"$1\" 2>&1 | grep -v '❯ '; pkill node 2>/dev/null || true"
