/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew bundle
stow .

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

ln -s ${pwd}/aerospace/.aerospace.toml ~/.aerospace.toml

ln -s "$(pwd)/sketchybar" ~/.config/sketchybar
ln -s "$(pwd)/ghostty" ~/.config/ghostty
ln -s "$(pwd)/neofetch" ~/.config/neofetch


ln -s "$(pwd)/jankyborders" ~/.config/borders

ln -s "$(pwd)/.zshrc" ~/.zshrc

gh extension install dlvhdr/gh-dash

eval "$(starship init zsh)"

