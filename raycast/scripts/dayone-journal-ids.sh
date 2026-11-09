#!/bin/bash
# Generate Day One journal name → journalId mapping and copy to clipboard

DB_PATH="$HOME/Library/Group Containers/5U8NS4GX82.dayoneapp2/Data/Documents/DayOne.sqlite"

sqlite3 -json "$DB_PATH" \
  "SELECT ZNAME as name, ZSYNCJOURNALID as journalId FROM ZJOURNAL WHERE ZHIDDEN = 0 ORDER BY ZSORTORDER;" |
  python3 -c "
import sys, json
data = json.load(sys.stdin)
print(json.dumps({d['name']: d['journalId'] for d in data}, indent=2, ensure_ascii=False))
" | pbcopy

echo "Copied to clipboard"
