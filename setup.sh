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
mkdir -p ~/config
ln -s "$SCRIPT_DIR/.zshrc" ~/.zshrc
ln -s "$SCRIPT_DIR/.local-zshrc" ~/.local-zshrc
ln -s "$SCRIPT_DIR/.ideavimrc" ~/.ideavimrc
ln -s "$SCRIPT_DIR/.vimrc" ~/.vimrc
ln -s "$SCRIPT_DIR/nvim" ~/.config/nvim
ln -s "$SCRIPT_DIR/tmux" ~/.config/tmux
ln -s "$SCRIPT_DIR/.ideavimrc" ~/.config/ideavim/ideavimrc
ln -s "$SCRIPT_DIR/ai/kent-beck-agent.md" ~/.claude/CLAUDE.md
ln -s "$SCRIPT_DIR/ai/kent-beck-agent.md" ~/.gemini/GEMINI.md

BREAKTIMER_CONFIG_PATH="~/Library/Application Support/BreakTimer/config.json'
rm $BREAKTIMER_CONFIG_PATH
ln -s "$SCRIPT_DIR/breaktimer/config.json" $BREAKTIMER_CONFIG_PATH

gh extension install dlvhdr/gh-dash

eval "$(starship init zsh)"

kubectl version --client

# Disable window animations https://nikitabobko.github.io/AeroSpace/goodies#disable-open-animations
defaults write -g NSAutomaticWindowAnimationsEnabled -bool false

# Enable repeat keys
defaults write -g ApplePressAndHoldEnabled O

# Delete nvim

rm -rf ~/.config/nvim
rm -rf ~/.local/share/nvim
rm -rf ~/.local/state/nvim

# Day one fix Just in case CLIKit failure
ln -s "/Applications/Day One.app/Contents/Frameworks" /usr/local/Frameworks

# jenv: https://www.jenv.be/
jenv enable-plugin export

# download latest kent-beck's AGENT.md
curl -o ./ai/kent-beck-agent.md https://raw.githubusercontent.com/KentBeck/BPlusTree3/refs/heads/main/rust/docs/CLAUDE.md
