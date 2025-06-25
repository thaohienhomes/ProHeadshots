#!/bin/bash

echo "🔧 Configuring Monitoring Services for ProHeadshots"
echo ""

# Function to configure Sentry
configure_sentry() {
    echo "🔍 Configuring Sentry Error Tracking..."
    echo ""
    echo "Please provide your Sentry DSN (from https://sentry.io):"
    echo "It should look like: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
    echo ""
    
    # Remove existing Sentry DSN
    echo "Removing existing Sentry configuration..."
    vercel env rm SENTRY_DSN production 2>/dev/null || echo "No existing SENTRY_DSN found"
    
    # Add new Sentry DSN
    echo "Adding new Sentry DSN..."
    vercel env add SENTRY_DSN production
    
    echo "✅ Sentry configuration complete!"
    echo ""
}

# Function to configure Google Analytics
configure_ga() {
    echo "📊 Configuring Google Analytics..."
    echo ""
    echo "Please provide your GA4 Measurement ID (from https://analytics.google.com):"
    echo "It should look like: G-XXXXXXXXXX"
    echo ""
    
    # Remove existing GA Measurement ID
    echo "Removing existing Google Analytics configuration..."
    vercel env rm NEXT_PUBLIC_GA_MEASUREMENT_ID production 2>/dev/null || echo "No existing GA_MEASUREMENT_ID found"
    
    # Add new GA Measurement ID
    echo "Adding new Google Analytics Measurement ID..."
    vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
    
    echo "✅ Google Analytics configuration complete!"
    echo ""
}

# Function to verify configuration
verify_config() {
    echo "🔍 Verifying monitoring configuration..."
    echo ""
    
    echo "Current environment variables:"
    vercel env ls production | grep -E "(SENTRY|GA_MEASUREMENT|MONITORING|ANALYTICS)" || echo "No monitoring variables found"
    
    echo ""
    echo "✅ Configuration verification complete!"
}

# Function to deploy with monitoring
deploy_with_monitoring() {
    echo "🚀 Deploying with monitoring configuration..."
    echo ""
    
    echo "This will deploy your application with:"
    echo "✅ Sentry error tracking"
    echo "✅ Google Analytics"
    echo "✅ Performance monitoring"
    echo "✅ Uptime monitoring"
    echo "✅ Health check API"
    echo ""
    
    read -p "Proceed with deployment? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        echo "Deploying to production..."
        vercel --prod
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "🔍 Test your monitoring:"
        echo "Health check: curl https://pro-headshots-9v0w8evmd-thaohienhomes-gmailcoms-projects.vercel.app/api/monitoring/health"
    else
        echo "Deployment cancelled."
    fi
}

# Main menu
main_menu() {
    echo "🎯 ProHeadshots Monitoring Setup"
    echo ""
    echo "Choose an option:"
    echo "1. Configure Sentry (Error Tracking)"
    echo "2. Configure Google Analytics"
    echo "3. Verify Configuration"
    echo "4. Deploy with Monitoring"
    echo "5. Configure All & Deploy"
    echo "6. Exit"
    echo ""
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            configure_sentry
            main_menu
            ;;
        2)
            configure_ga
            main_menu
            ;;
        3)
            verify_config
            main_menu
            ;;
        4)
            deploy_with_monitoring
            main_menu
            ;;
        5)
            configure_sentry
            configure_ga
            verify_config
            deploy_with_monitoring
            ;;
        6)
            echo "👋 Setup complete! Your monitoring systems are ready."
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-6."
            main_menu
            ;;
    esac
}

# Start the setup
echo "🚀 Welcome to ProHeadshots Monitoring Setup!"
echo ""
echo "This script will help you configure:"
echo "🔍 Sentry - Error tracking and performance monitoring"
echo "📊 Google Analytics - User behavior and conversion tracking"
echo ""
echo "Prerequisites:"
echo "1. Sentry account and DSN (https://sentry.io)"
echo "2. Google Analytics 4 property and Measurement ID (https://analytics.google.com)"
echo ""

read -p "Do you have both prerequisites ready? (y/N): " ready
if [[ $ready == [yY] || $ready == [yY][eE][sS] ]]; then
    main_menu
else
    echo ""
    echo "📋 Please complete the prerequisites first:"
    echo ""
    echo "🔍 For Sentry:"
    echo "1. Go to https://sentry.io"
    echo "2. Create account and project"
    echo "3. Copy the DSN"
    echo ""
    echo "📊 For Google Analytics:"
    echo "1. Go to https://analytics.google.com"
    echo "2. Create property and data stream"
    echo "3. Copy the Measurement ID (G-XXXXXXXXXX)"
    echo ""
    echo "Run this script again when ready!"
fi
