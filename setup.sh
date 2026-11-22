#!/bin/bash
# setup.sh — idempotent dotfiles bootstrap.
# Usage: ./setup.sh [--apps|--dotfiles|--defaults|--all|--help]
# Flags compose; default is --all. Safe to re-run.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }

link() { # link <src> <dst>
  local src=$1 dst=$2 bak
  if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then
    return 0
  fi
  if [ -e "$dst" ] && [ ! -L "$dst" ]; then
    bak="$dst.bak.$(date +%Y%m%d%H%M%S)"
    echo "backing up $dst -> $bak"
    mv "$dst" "$bak"
  fi
  rm -f "$dst"
  mkdir -p "$(dirname "$dst")"
  ln -s "$src" "$dst"
}

usage() {
  cat <<EOF
Usage: $0 [--apps|--dotfiles|--defaults|--all|--help]

  --apps      brew bundle + gh extensions + jenv plugin
  --dotfiles  stow packages + manual symlinks + pre-commit hooks
  --defaults  macos.sh system defaults
  --all       all of the above (default)
EOF
}

DO_APPS=false DO_DOTFILES=false DO_DEFAULTS=false
if [ $# -eq 0 ]; then
  DO_APPS=true DO_DOTFILES=true DO_DEFAULTS=true
fi
for arg in "$@"; do
  case $arg in
    --apps) DO_APPS=true ;;
    --dotfiles) DO_DOTFILES=true ;;
    --defaults) DO_DEFAULTS=true ;;
    --all) DO_APPS=true DO_DOTFILES=true DO_DEFAULTS=true ;;
    -h | --help) usage && exit 0 ;;
    *) echo "unknown flag: $arg" >&2 && usage >&2 && exit 1 ;;
  esac
done

if [ "$DO_APPS" = true ]; then
  if ! have brew; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew bundle --file="$SCRIPT_DIR/Brewfile"

  if [ ! -d "$HOME/.oh-my-zsh" ]; then
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  fi

  if have gh && ! gh extension list 2>/dev/null | grep -q 'dlvhdr/gh-dash'; then
    gh extension install dlvhdr/gh-dash
  fi

  if have jenv; then
    jenv enable-plugin export
  fi

  if have kubectl; then
    kubectl version --client
  fi
fi

if [ "$DO_DOTFILES" = true ]; then
  if ! have stow; then
    echo "stow missing (brew bundle not run?). Skipping links." >&2
  else
    # Explicit package list. Never `stow .`: repo root holds non-package
    # dirs like scripts/, ai/, raycast/ that must not link into $HOME.
    stow -t ~ zsh ghostty aerospace nvim
  fi

  link "$SCRIPT_DIR/agents" ~/.agents
  link "$SCRIPT_DIR/sketchybar" ~/.config/sketchybar
  link "$SCRIPT_DIR/neofetch" ~/.config/neofetch
  mkdir -p ~/.config/herdr
  if [ -f ~/.config/herdr/config.toml ] && [ ! -L ~/.config/herdr/config.toml ]; then
    mv ~/.config/herdr/config.toml ~/.config/herdr/config.toml.bak."$(date +%Y%m%d%H%M%S)"
  fi
  link "$SCRIPT_DIR/herdr/config.toml" ~/.config/herdr/config.toml

  link "$SCRIPT_DIR/jankyborders" ~/.config/borders
  link "$SCRIPT_DIR/starship/tokyo-night.toml" ~/.config/starship.toml

  link "$SCRIPT_DIR/.ideavimrc" ~/.ideavimrc
  link "$SCRIPT_DIR/.vimrc" ~/.vimrc
  link "$SCRIPT_DIR/tmux" ~/.config/tmux
  link "$SCRIPT_DIR/tmux/.tmux.conf" ~/.tmux.conf
  link "$SCRIPT_DIR/.ideavimrc" ~/.config/ideavim/ideavimrc
  link "$SCRIPT_DIR/ai/kent-beck-agent.md" ~/.claude/CLAUDE.md
  link "$SCRIPT_DIR/ai/kent-beck-agent.md" ~/.gemini/GEMINI.md

  link "$SCRIPT_DIR/opencode" ~/.config/opencode

  # BreakTimer: quoted path (spaces), no clobber of live config.
  BREAKTIMER_CONFIG_PATH="$HOME/Library/Application Support/BreakTimer/config.json"
  if [ ! -e "$BREAKTIMER_CONFIG_PATH" ]; then
    mkdir -p "$(dirname "$BREAKTIMER_CONFIG_PATH")"
    link "$SCRIPT_DIR/breaktimer/config.json" "$BREAKTIMER_CONFIG_PATH"
  fi

  # nvim: back up live config, never delete. Stow owns the path now.
  if [ -e ~/.config/nvim ] && [ ! -L ~/.config/nvim ]; then
    mv ~/.config/nvim ~/.config/nvim.pre-setup."$(date +%Y%m%d%H%M%S)"
  fi
  for d in ~/.local/share/nvim ~/.local/state/nvim; do
    if [ -e "$d" ]; then
      mv "$d" "$d.pre-setup.$(date +%Y%m%d%H%M%S)"
    fi
  done

  # Day One CLIKit fix. Needs write access to /usr/local/Frameworks.
  if [ -e "/Applications/Day One.app" ] && [ ! -e /usr/local/Frameworks ]; then
    ln -s "/Applications/Day One.app/Contents/Frameworks" /usr/local/Frameworks 2>/dev/null ||
      echo "skip Day One fix: no write access to /usr/local/Frameworks" >&2
  fi

  # Refresh vendored agent doc.
  if have curl; then
    curl -fsSL -o "$SCRIPT_DIR/ai/kent-beck-agent.md" \
      https://raw.githubusercontent.com/KentBeck/BPlusTree3/refs/heads/main/rust/docs/CLAUDE.md
  fi

  if have pre-commit; then
    pre-commit install --install-hooks
  fi
fi

if [ "$DO_DEFAULTS" = true ]; then
  bash "$SCRIPT_DIR/macos.sh"
fi

echo "setup done."
