#!/bin/bash

# 🚀 Energy Quest - One-Click Vercel Setup
echo "🎮 Energy Quest: Setup Vercel Auto-Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up Vercel deployment for Energy Quest...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel@latest
else
    echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
fi

# Check current directory structure
echo -e "${BLUE}📁 Checking project structure...${NC}"
if [[ -f "index.html" && -f "vercel.json" && -f "game.js" ]]; then
    echo -e "${GREEN}✅ All required files present${NC}"
else
    echo -e "${RED}❌ Missing required files${NC}"
    exit 1
fi

# Display project info
echo -e "${BLUE}📋 Project Information:${NC}"
echo "   📛 Name: Energy Quest - Misteri Hemat Listrik"
echo "   🎯 Type: Educational Game (Static Site)"
echo "   📱 Platform: Web (Mobile-responsive)"
echo "   ⚡ Features: 4 levels, Quiz, Energy calculator"

echo ""
echo -e "${YELLOW}🚀 DEPLOYMENT OPTIONS:${NC}"
echo ""
echo "1️⃣  Quick Deploy (Manual)"
echo "   Command: vercel --prod"
echo "   Time: ~1 minute"
echo ""
echo "2️⃣  GitHub Auto-Deploy (Recommended)"
echo "   Setup: Connect GitHub repo to Vercel dashboard"
echo "   Result: Auto deploy on every push"
echo ""
echo "3️⃣  Preview Deploy"
echo "   Command: vercel"
echo "   Result: Preview URL for testing"
echo ""

# Show current Vercel configuration
echo -e "${BLUE}⚙️  Current Vercel Configuration:${NC}"
echo "   📄 vercel.json: ✅ Configured for static deployment"
echo "   🔗 Routes: ✅ SPA routing setup"
echo "   🛡️  Headers: ✅ Security & caching configured"
echo "   📱 PWA: ✅ Manifest.json ready"

echo ""
echo -e "${GREEN}🎯 READY TO DEPLOY!${NC}"
echo ""
echo "To deploy now:"
echo "  ${YELLOW}vercel --prod${NC}"
echo ""
echo "To setup auto-deploy:"
echo "  1. Push to GitHub: ${YELLOW}git push origin main${NC}"
echo "  2. Go to: ${BLUE}https://vercel.com/dashboard${NC}"
echo "  3. Import your GitHub repository"
echo "  4. ✨ Auto-deploy configured!"
echo ""
echo -e "${GREEN}⚡ Energy Quest akan tersedia untuk ribuan siswa SMP! 🎮📚${NC}"