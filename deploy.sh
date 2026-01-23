#!/bin/bash

# Talent-IQ Quick Deployment Script

echo "🚀 Talent-IQ Deployment Setup"
echo "=============================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Git initialized"
fi

# Check GitHub credentials
echo ""
echo "📋 GitHub Setup:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/username/talent-iq.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"

# Railway deployment
echo ""
echo "🚂 Railway Deployment:"
echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub Repo'"
echo "4. Select this repository"
echo "5. Add environment variables:"
echo "   - DB_URL (MongoDB Atlas)"
echo "   - CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - STREAM_API_KEY"
echo "   - STREAM_API_SECRET"
echo "   - INNGEST_EVENT_KEY"
echo "   - INNGEST_SIGNING_KEY"
echo "   - CLIENT_URL (your Vercel frontend URL)"
echo "6. Deploy!"

# Vercel deployment
echo ""
echo "▲ Vercel Deployment (Frontend):"
echo "1. Go to https://vercel.com"
echo "2. Sign up with GitHub"
echo "3. Click 'Add New' → 'Project'"
echo "4. Select this repository"
echo "5. Set root directory to './frontend'"
echo "6. Add environment variables:"
echo "   - VITE_API_URL (your Railway backend URL)"
echo "   - VITE_STREAM_API_KEY"
echo "   - VITE_CLERK_PUBLISHABLE_KEY"
echo "7. Deploy!"

echo ""
echo "✅ Setup complete! Follow the steps above to deploy."
