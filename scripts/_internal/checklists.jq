.checklists[] |
"### " + .name + "\n" + (
  [
    .checkItems[] |
    "- [" + (if .state == "complete" then "x" else " " end) + "] " + .name
  ] | join("\n")
)