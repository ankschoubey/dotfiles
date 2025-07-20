/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

git clone https://github.com/ankschoubey/dotfiles.git $HOME/Documents/Github/dotfiles

cd $HOME/Documents/Github/dotfiles

brew bundle
stow .