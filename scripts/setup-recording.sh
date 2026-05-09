#!/bin/bash

set -e

DOTFILES_ROOT="${DOTFILES_ROOT:-$HOME/Documents/Github/dotfiles-1}"

echo "🎬 Setting up recording environment..."

# Step 1: Close all apps except Day One
# REMOVED - user requested to skip this step

# Step 2: Change LG monitor (34 inch external) resolution to 1920x1080
# Using set-secondary-1080.sh script
echo "🖥️ Setting LG monitor to 1920x1080..."
"$DOTFILES_ROOT/scripts/set-secondary-1080.sh"

# Step 3: Switch to workspace 1
echo "1️⃣ Moving to workspace 1..."
aerospace workspace 1 2>/dev/null || aerospace exec "workspace 1"

# Step 4: Open OBS and move to workspace 1
echo "📹 Opening OBS in workspace 1..."
open -a OBS 2>/dev/null || echo "OBS not installed"
sleep 1
aerospace exec "move-node-to-workspace 1 --focus-follows-window" 2>/dev/null || echo "AeroSpace not running"

# Step 5: Open Day One and move to workspace 1
echo "📓 Opening Day One in workspace 1..."
open -a "Day One" 2>/dev/null || echo "Day One not installed"
sleep 1
aerospace exec "move-node-to-workspace 1 --focus-follows-window" 2>/dev/null || echo "AeroSpace not running"

echo "✅ Recording environment ready!"