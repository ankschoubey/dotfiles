#!/bin/bash

PROJECT="/Users/ankushchoubey/Documents/Github/safari-highlighter"

# `-b`, not `-a "IntelliJ IDEA"`: the bundle name lookup silently fails. The
# app's process is `idea`, so `pgrep -x "IntelliJ IDEA"` never matches either.
#
# Only launch when not already running. Launching a second instance while a
# previous one is still shutting down crashes project loading with
# "VFS is already closed (disposed)" and IDEA exits. Reusing the live instance
# avoids that and is what you want anyway — the project is already open.
if ! pgrep -f "MacOS/idea$" >/dev/null; then
    open -b com.jetbrains.intellij "$PROJECT"
fi

open -a Xcode "$PROJECT/apple-xcode/Fast Highlighter.xcodeproj"