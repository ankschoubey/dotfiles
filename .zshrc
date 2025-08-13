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

starship preset tokyo-night -o ~/.config/starship.toml

# Aliases

# function y() {
# 	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
# 	yazi "$@" --cwd-file="$tmp"
# 	IFS= read -r -d '' cwd < "$tmp"
# 	[ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
# 	rm -f -- "$tmp"
# }

function sw() {
  aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'
  osascript -e 'quit app "Terminal"'  
}
function title {
  printf "\033]0;%s\007" "$1"
}
#neofetch
export DOTFILES_ROOT="${${(%):-%x}:A:h}"

alias ls='ls -lh --color=always'
alias vi='nvim'
alias vim='nvim'
alias ge="gemini"
alias gey="gemini --yolo"
alias c='claude'
alias cy='claude --dangeriously-skip-permissions'
alias restartAerospace='sh $DOTFILES_ROOT/scripts/restartAerospace.sh'
alias todo='title "Inbox 📥"; vim TODO.md'
alias n='todo'
alias editConfig='vi $DOTFILES_ROOT'

alias cat='bat'
alias ls='exa'

work() {
  # usage: work 10m, work 60s etc. Default is 20m
  timer "${1:-20m}" && terminal-notifier -message 'QUAK 🦆'\
        -title 'Work Timer is up! Take a Break 🦆'\
        -appIcon '$DOTFILES_ROOT/wallpaper/beautiful-mountains-landscape.jpg'\
        -sound Crystal
}

rest() {
  # usage: rest 10m, rest 60s etc. Default is 5m
  timer "${1:-5m}" && terminal-notifier -message 'FUEL 🚀'\
        -title 'Break is over! Get back to work 🚀'\
        -appIcon '~/Pictures/pumpkin.png'\
        -sound Crystal
}
alias w='work'
alias r='rest'

function kubectl() { echo "+ kubectl $@" >&2; command kubectl "$@"; }

notify() {
    title=${1:-"Stream"}
    prev=""
    while IFS= read -r line; do
        echo "$line"
        if [ "$line" != "$prev" ]; then
            terminal-notifier -title "$title" -message "$line"
            prev="$line"
        fi
    done
}

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

alias r='sh ./scripts/$(ls ./scripts | fzf)'

[ -f "$DOTFILES_ROOT/.kubectl_aliases" ] && source "$DOTFILES_ROOT/.kubectl_aliases"
