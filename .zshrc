ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"
[ ! -d $ZINIT_HOME ] && mkdir -p "$(dirname $ZINIT_HOME)"
[ ! -d $ZINIT_HOME/.git ] && git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
source "${ZINIT_HOME}/zinit.zsh"

if [[ -f "/opt/homebrew/bin/brew" ]] then
  # If you're using macOS, you'll want this enabled
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

zinit ice as"command" from"gh-r" \
          atclone"./starship init zsh > init.zsh; ./starship completions zsh > _starship" \
          atpull"%atclone" src"init.zsh"
zinit light starship/starship
zinit light zsh-users/zsh-autosuggestions
zinit light zsh-users/zsh-syntax-highlighting
zinit light zsh-users/zsh-completions
zinit light Aloxaf/fzf-tab


# Add in snippets
zinit snippet OMZP::sudo
# zinit snippet OMZP::copydir
# zinit snippet OMZP::osx


# Load completions

autoload -U compinit && compinit

starship preset jetpack -o ~/.config/starship.toml

# Aliases

function y() {
	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
	yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
	rm -f -- "$tmp"
}

function sw() {
  aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "/Applications/Aerospace.app/Contents/MacOS/aerospace focus --window-id {1}")+abort'
}

#neofetch
export DOTFILES_ROOT="${${(%):-%x}:A:h}"

alias ls='ls -lh --color=always | fzf'
alias vi='nvim'
alias ge="gemini"
alias gey="gemini --yolo"
alias c='claude'
alias cy='claude --dangeriously-skip-permissions'
alias restartAerospace='sh $DOTFILES_ROOT/scripts/restartAerospace.sh'

zinit cdreplay -q

# History
HISTSIZE=5000
HISTFILE=~/.zsh_history
SAVEHIST=$HISTSIZE
HISTDUP=erase
setopt appendhistory
setopt sharehistory
setopt hist_ignore_space
setopt hist_ignore_all_dups
setopt hist_save_no_dups
setopt hist_ignore_dups
setopt hist_find_no_dups

# Completion styling
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
zstyle ':completion:*' menu no
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'ls --color $realpath'
zstyle ':fzf-tab:complete:__zoxide_z:*' fzf-preview 'ls --color $realpath'

# Shell integrations
eval "$(fzf --zsh)"
eval "$(zoxide init --cmd cd zsh)"

alias ctx="$DOTFILES_ROOT/ai/context/context"

# Load local zshrc if it exists
if [[ -f ~/.local-zshrc ]]; then
    source ~/.local-zshrc
fi