@echo off
echo 🚀 Starting coolpix.me Production Deployment
echo ==============================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Verify build works locally
echo 🔨 Testing production build...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Deployment successful!
    echo.
    echo 📋 Next steps:
    echo 1. Configure custom domain in Vercel dashboard
    echo 2. Set up environment variables (see vercel-env-vars.txt)
    echo 3. Update OAuth redirect URIs
    echo 4. Test the live application
    echo.
    echo 🔧 Don't forget to:
    echo - Fix Polar access token permissions
    echo - Update Google OAuth redirect URIs
    echo - Update Supabase auth configuration
    echo.
) else (
    echo ❌ Deployment failed! Check the error messages above.
    pause
    exit /b 1
)

pause
