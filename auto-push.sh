#!/bin/bash

# Auto Push Script - No more ribet! 🚀
echo "🚀 AUTO PUSH TO GITHUB + VERCEL DEPLOY"
echo "======================================"

# Check if there are changes
if git diff --quiet && git diff --staged --quiet; then
    echo "❌ No changes to commit!"
    exit 0
fi

# Get commit message from user or use default
if [ -z "$1" ]; then
    COMMIT_MSG="🔥 Auto update $(date '+%Y-%m-%d %H:%M')"
else
    COMMIT_MSG="$1"
fi

echo "📝 Commit message: $COMMIT_MSG"

# Add all files
echo "📦 Adding files..."
git add .

# Commit with message
echo "💾 Committing..."
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
current_branch=$(git branch --show-current)
git push origin $current_branch

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Auto push complete!"
    echo "🌐 Game will auto-deploy to: https://energi-listrik.vercel.app"
    echo "⏱️  Deploy usually takes 1-2 minutes"
    echo ""
    echo "🎮 Ready to test!"
else
    echo "❌ Push failed! Check your connection or credentials."
fi