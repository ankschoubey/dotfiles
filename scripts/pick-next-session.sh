#!/bin/bash

export PATH="$HOME/.local/bin:$PATH"

cd /Users/ankushchoubey/Documents/Github/executor-agent || exit 1

exec "$HOME/.local/bin/agent" "/pick-next"