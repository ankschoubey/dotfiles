#!/bin/sh

DEFCOLOR="0xFFFFFFFF"
ALERTCOLOR="0xFFFFFFFF"
TOTALSWAP_MB="$(sysctl vm.swapusage | awk '{print $4}' | sed 's/M//')"
TOTALSWAP_GB=$(echo "scale=1; $TOTALSWAP_MB / 1024" | bc)
TOTALSWAP="${TOTALSWAP_GB}G"

clr=""
if [ "$TOTALSWAP" != "0.00M" ]; then
    clr="$ALERTCOLOR"
else
    clr="$DEFCOLOR"
fi

sketchybar --set "$NAME" label="$TOTALSWAP" icon.color="$clr" label.color="$clr"