/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew bundle
stow .

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ln -s "$SCRIPT_DIR/aerospace/.aerospace.toml" ~/.aerospace.toml

ln -s "$SCRIPT_DIR/sketchybar" ~/.config/sketchybar
ln -s "$SCRIPT_DIR/ghostty" ~/.config/ghostty
ln -s "$SCRIPT_DIR/neofetch" ~/.config/neofetch


ln -s "$SCRIPT_DIR/jankyborders" ~/.config/borders

ln -s "$SCRIPT_DIR/.zshrc" ~/.zshrc

gh extension install dlvhdr/gh-dash

eval "$(starship init zsh)"

