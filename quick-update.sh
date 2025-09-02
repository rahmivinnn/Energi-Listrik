#!/bin/bash

# Quick Update Script - Super Fast! ⚡
# Usage: ./quick-update.sh "your commit message"

git add . && git commit -m "${1:-🔥 Quick update}" && git push origin master && echo "🚀 DONE! Check https://energi-listrik.vercel.app in 2 mins!"