#!/bin/bash

export PATH="$HOME/.local/bin:$PATH"

cd "${1:?usage: pick-next-session.sh <project-dir>}" || exit 1

exec /opt/homebrew/bin/opencode --prompt "/pick-next"