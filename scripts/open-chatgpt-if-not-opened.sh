#!/bin/bash
# shellcheck shell=bash
if ! pgrep -x "ChatGPT" >/dev/null; then open -a /Applications/ChatGPT.app; fi
