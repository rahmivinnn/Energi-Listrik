#!/bin/bash

# 🚀 ENERGY QUEST - SUPER AUTO DEPLOY
# Usage: ./deploy-auto.sh "commit message"
# Or just: ./deploy-auto.sh (uses auto message)

clear
echo "🎮 ENERGY QUEST - AUTO DEPLOYMENT"
echo "================================="
echo ""

# Set commit message
if [ -z "$1" ]; then
    COMMIT_MSG="🔥 Auto update $(date '+%Y-%m-%d %H:%M')"
else
    COMMIT_MSG="$1"
fi

echo "📝 Commit: $COMMIT_MSG"
echo ""

# Check for changes
if git diff --quiet && git diff --staged --quiet; then
    echo "⚠️  No changes detected!"
    echo "🤔 Are you sure you want to deploy?"
    read -p "Continue? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 0
    fi
fi

# Step 1: Git operations
echo "📦 Step 1: Preparing Git..."
git add .
git commit -m "$COMMIT_MSG"

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
    echo "⚠️  You're on branch '$current_branch'"
    echo "🔄 Switching to main branch for deployment..."
    git checkout main 2>/dev/null || git checkout master 2>/dev/null
    git merge "$current_branch"
fi

# Step 2: Push to GitHub (triggers auto-deploy)
echo "🚀 Step 2: Pushing to GitHub..."
git push origin HEAD

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo "🤖 GitHub Actions will auto-deploy to Vercel"
    echo ""
    echo "📱 Track deployment:"
    echo "   GitHub Actions: https://github.com/yourusername/energy-quest-game/actions"
    echo "   Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "🌐 Game will be live at: https://energi-listrik.vercel.app"
    echo "⏱️  Deployment usually takes 2-3 minutes"
    echo ""
    echo "🎮 ENERGY QUEST READY TO PLAY! ⚡"
else
    echo ""
    echo "❌ FAILED! Git push error"
    echo "🔧 Check your internet connection and GitHub credentials"
    echo ""
    echo "💡 Quick fixes:"
    echo "   1. git remote -v (check remote URL)"
    echo "   2. git status (check branch status)"
    echo "   3. git pull (sync with remote)"
fi