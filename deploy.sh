#!/bin/bash

# Energy Quest Deployment Script
echo "🚀 Energy Quest - Auto Deploy to Vercel"
echo "======================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if this is first time setup
if [ ! -f ".vercel/project.json" ]; then
    echo "🔧 First time setup - configuring Vercel project..."
    vercel link
else
    echo "✅ Vercel project already configured"
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✨ Deployment complete!"
echo "🌐 Your game is now live on Vercel!"