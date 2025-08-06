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
ln -s "$SCRIPT_DIR/starship/tokyo-night.toml" ~/.config/starship.toml

if [ -f ~/.zshrc ] && [ ! -L ~/.zshrc ]; then
  mv ~/.zshrc ~/.local-zshrc
fi
ln -s "$SCRIPT_DIR/.zshrc" ~/.zshrc
ln -s "$SCRIPT_DIR/.local-zshrc" ~/.local-zshrc
gh extension install dlvhdr/gh-dash

eval "$(starship init zsh)"

kubectl version --client

# Disable window animations https://nikitabobko.github.io/AeroSpace/goodies#disable-open-animations
defaults write -g NSAutomaticWindowAnimationsEnabled -bool false

# Enable repeat keys
defaults write -g ApplePressAndHoldEnabled O