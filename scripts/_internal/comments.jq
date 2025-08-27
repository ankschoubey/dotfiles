.actions[] |
select(.type == "commentCard") |
"**\(.memberCreator.fullName)** on _\(.date)_:\n\n\(.data.text)\n\n---\n"