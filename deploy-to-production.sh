#!/bin/bash

# coolpix.me Production Deployment Script
echo "🚀 Starting coolpix.me Production Deployment"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Verify build works locally
echo "🔨 Testing production build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure custom domain in Vercel dashboard"
    echo "2. Set up environment variables (see vercel-env-vars.txt)"
    echo "3. Update OAuth redirect URIs"
    echo "4. Test the live application"
    echo ""
    echo "🔧 Don't forget to:"
    echo "- Fix Polar access token permissions"
    echo "- Update Google OAuth redirect URIs"
    echo "- Update Supabase auth configuration"
    echo ""
else
    echo "❌ Deployment failed! Check the error messages above."
    exit 1
fi
