#!/bin/bash

CONTEXT_PATH="/Users/ankushchoubey/Documents/Github/dotfiles-1/ai/context/context"

echo "--- Starting ctx current test ---"

echo "1. Adding a new task: 'My first task'"
"$CONTEXT_PATH" current add "My first task"
echo ""

echo "2. Listing tasks after adding:"
"$CONTEXT_PATH" current list
echo ""

echo "3. Marking task 1 as in progress"
"$CONTEXT_PATH" current progress 1
echo ""

echo "4. Listing tasks after marking in progress:"
"$CONTEXT_PATH" current list
echo ""

echo "5. Marking task 1 as complete"
"$CONTEXT_PATH" current complete 1
echo ""

echo "6. Listing tasks after marking complete:"
"$CONTEXT_PATH" current list
echo ""

echo "7. Adding another task: 'Second task'"
"$CONTEXT_PATH" current add "Second task"
echo ""

echo "8. Listing tasks after adding second task:"
"$CONTEXT_PATH" current list
echo ""

echo "9. Removing task 1"
"$CONTEXT_PATH" current remove 1
echo ""

echo "10. Listing tasks after removing task 1:"
"$CONTEXT_PATH" current list
echo ""

echo "--- Test complete ---"