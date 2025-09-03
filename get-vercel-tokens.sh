#!/bin/bash

# 🔑 VERCEL TOKENS HELPER
echo "🔑 VERCEL TOKENS SETUP HELPER"
echo "============================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo ""
fi

# Login to Vercel
echo "🔐 Step 1: Login to Vercel"
echo "Please login to your Vercel account..."
vercel login

echo ""
echo "🔗 Step 2: Link Project"
echo "This will create .vercel/project.json with your IDs..."
vercel link

# Show the project config
if [ -f ".vercel/project.json" ]; then
    echo ""
    echo "✅ SUCCESS! Here are your Vercel IDs:"
    echo "===================================="
    cat .vercel/project.json
    echo ""
    echo "📋 COPY THESE TO GITHUB SECRETS:"
    echo "--------------------------------"
    echo "VERCEL_ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)"
    echo "VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)"
    echo ""
else
    echo "❌ Project linking failed. Try again!"
fi

echo "🔑 VERCEL_TOKEN:"
echo "Go to: https://vercel.com/account/tokens"
echo "Create new token → Copy to GitHub Secrets"
echo ""
echo "📍 WHERE TO ADD SECRETS:"
echo "GitHub Repository → Settings → Secrets and variables → Actions"
echo ""
echo "🚀 After adding secrets, auto-deployment will work!"