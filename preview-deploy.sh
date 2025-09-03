#!/bin/bash

# 🎮 Energy Quest - Preview & Deploy Script
echo "🎮 Energy Quest: Misteri Hemat Listrik"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Start local preview
echo "🖥️  Starting local preview..."
echo "📍 URL: http://localhost:8000"
echo "🎯 Game akan terbuka di browser"
echo ""

# Check if python3 is available
if command_exists python3; then
    echo "🐍 Using Python server..."
    python3 -m http.server 8000 &
    SERVER_PID=$!
elif command_exists node; then
    echo "📦 Using Node.js server..."
    npx serve . -l 8000 &
    SERVER_PID=$!
elif command_exists php; then
    echo "🐘 Using PHP server..."
    php -S localhost:8000 &
    SERVER_PID=$!
else
    echo "❌ No server available. Install Python3, Node.js, or PHP"
    exit 1
fi

echo "✅ Server started (PID: $SERVER_PID)"
echo ""

# Wait a moment for server to start
sleep 2

# Try to open browser (if available)
if command_exists xdg-open; then
    xdg-open http://localhost:8000
elif command_exists open; then
    open http://localhost:8000
else
    echo "🌐 Manually open: http://localhost:8000"
fi

echo ""
echo "🎮 PREVIEW GAME FEATURES:"
echo "========================"
echo "✅ Opening animation (30 detik)"
echo "✅ Main menu dengan 4 opsi"
echo "✅ Level 1: Kamar Tidur - Puzzle lampu"
echo "✅ Level 2: Ruang Tamu - AC efficiency"
echo "✅ Level 3: Dapur - Peralatan listrik"
echo "✅ Level 4: Lab - Rescue scientist"
echo "✅ Quiz sistem dengan randomization"
echo "✅ Energy calculator (tarif PLN 2024)"
echo "✅ Save/load game progress"
echo "✅ Mobile touch controls"
echo ""

# Ask for deployment
echo "🚀 READY TO DEPLOY TO VERCEL?"
echo "=============================="
echo ""
echo "Opsi 1: Deploy manual"
echo "  vercel --prod"
echo ""
echo "Opsi 2: Setup auto-deploy"
echo "  1. Push ke GitHub: git push origin main"
echo "  2. Connect Vercel dashboard ke repo"
echo "  3. Auto deploy setiap push!"
echo ""
echo "Opsi 3: Deploy sekarang dengan script"
read -p "Deploy ke Vercel sekarang? (y/n): " deploy_choice

if [[ $deploy_choice == "y" || $deploy_choice == "Y" ]]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel@latest
    fi
    
    # Deploy to Vercel
    echo "🌐 Starting deployment..."
    vercel --prod
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "✨ Energy Quest is now live on Vercel!"
    echo "🎮 Share the URL to let students play and learn!"
else
    echo ""
    echo "⏸️  Deployment skipped"
    echo "🎮 Game preview tetap berjalan di http://localhost:8000"
    echo "🚀 Deploy kapan saja dengan: vercel --prod"
fi

echo ""
echo "⚡ Energy Quest ready to educate students about energy efficiency!"
echo "🎯 Press Ctrl+C to stop preview server"

# Keep script running to maintain server
wait $SERVER_PID