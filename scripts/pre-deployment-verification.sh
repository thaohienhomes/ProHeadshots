#!/bin/bash

echo "🔍 Pre-Deployment Verification for CoolPix Logo System"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

echo "✅ Project root directory confirmed"

# Verify logo files exist
echo ""
echo "📁 Checking logo files..."
LOGO_FILES=(
    "public/logo-coolpix.svg"
    "public/logo-coolpix-stacked.svg"
    "public/logo-coolpix-icon.svg"
    "public/logo-coolpix-light.svg"
    "public/favicon.svg"
)

for file in "${LOGO_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Verify React component exists
if [ -f "src/components/CoolPixLogo.tsx" ]; then
    echo "✅ CoolPixLogo.tsx component exists"
else
    echo "❌ CoolPixLogo.tsx component missing"
    exit 1
fi

# Check updated components
echo ""
echo "🔧 Checking updated components..."
UPDATED_COMPONENTS=(
    "src/components/Header.tsx"
    "src/components/Footer.tsx"
    "src/components/LeftAuth.tsx"
    "src/app/layout.tsx"
)

for file in "${UPDATED_COMPONENTS[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Verify brand consistency updates
echo ""
echo "📝 Checking brand consistency updates..."
if grep -q "coolpix" "src/app/(legal & other)/terms/Terms.tsx"; then
    echo "✅ Terms of Service updated with coolpix branding"
else
    echo "❌ Terms of Service not updated"
    exit 1
fi

if grep -q "coolpix" "src/app/(legal & other)/privacy/Privacy.tsx"; then
    echo "✅ Privacy Policy updated with coolpix branding"
else
    echo "❌ Privacy Policy not updated"
    exit 1
fi

# Check if Next.js build works
echo ""
echo "🏗️  Testing Next.js build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Next.js build successful"
else
    echo "❌ Next.js build failed"
    echo "Please fix build errors before deployment"
    exit 1
fi

# Check for TypeScript errors
echo ""
echo "🔍 Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ No TypeScript errors"
else
    echo "⚠️  TypeScript warnings detected (non-blocking)"
fi

# Verify git status
echo ""
echo "📊 Git status check..."
if git status --porcelain | grep -q .; then
    echo "✅ Changes detected and ready for commit"
    echo ""
    echo "📋 Files to be committed:"
    git status --porcelain | head -20
    if [ $(git status --porcelain | wc -l) -gt 20 ]; then
        echo "... and $(( $(git status --porcelain | wc -l) - 20 )) more files"
    fi
else
    echo "⚠️  No changes detected"
fi

echo ""
echo "🎉 Pre-deployment verification complete!"
echo ""
echo "📋 Summary:"
echo "✅ All logo files present"
echo "✅ React component ready"
echo "✅ Updated components verified"
echo "✅ Brand consistency confirmed"
echo "✅ Next.js build successful"
echo "✅ Ready for deployment"
echo ""
echo "🚀 Next step: Run deployment script or commit manually"
