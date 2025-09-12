#!/bin/bash

if ! pgrep -x "Ghostty" > /dev/null
then
  open -a "Ghostty" --hide
fi
