export PS1='\[\e[38;5;44m\]@\[\e[38;5;41m\]\w\[\e[38;5;41m\]> \[\e[0m\]'

HISTTIMEFORMAT="%F %T "
HISTCONTROL=ignoredups

# git
alias push='git push'
alias pull='git pull'
alias status='git status'
alias merge='git merge'

alias tree='ls -R'  # create a tree view of the repo

run() {
    /run.sh
}

#json(path) {
    #pkl eval -f json $path
#}